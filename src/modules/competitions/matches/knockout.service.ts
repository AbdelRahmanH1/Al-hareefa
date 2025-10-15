import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { AllMatchResponseDto } from './dto/response/allMatchsResponse.dto';
import { mapMatchToDto } from 'src/shared/helpers/match.mapper';
import {
  getMatchStage,
  getMatchStatus,
  shuffleArray,
} from './utils/match.helper';

@Injectable()
export class KnockoutService {
  constructor(private readonly prisma: PrismaService) {}

  async generateFirstRound(competitionId: bigint, userId: bigint) {
    const QUALIFIERS_PER_GROUP = 2;

    const competition = await this.prisma.competition.findUnique({
      where: {
        id: competitionId,
        organization_id: userId,
        approval_status: 'ACCEPTED',
      },

      include: {
        matches: true,
        participants: {
          include: { team: true, player: { include: { user: true } } },
        },
        groups: true,
      },
    });

    if (!competition)
      throw new BadRequestException('Competition not found or unauthorized');

    if (competition.hasGroupStage) {
      if (competition.groups.length === 0) {
        throw new BadRequestException('Group stage must be generated first');
      }

      const remainingGroupMatches = await this.prisma.match.count({
        where: {
          competition_id: competitionId,
          stage: 'GROUP_STAGE',
          status: { not: 'COMPLETED' },
        },
      });

      if (remainingGroupMatches > 0) {
        throw new BadRequestException(
          'Cannot start knockout — some group matches are still ongoing',
        );
      }

      const knockoutAlreadyExists = competition.matches.some(
        (m) => m.stage === 'KNOCKOUT',
      );
      if (knockoutAlreadyExists) {
        throw new BadRequestException('Knockout matches already generated');
      }

      const groupsWithStandings = await this.prisma.competitionGroup.findMany({
        where: { competition_id: competitionId },
        include: {
          standing: {
            orderBy: [{ points: 'desc' }],
            take: QUALIFIERS_PER_GROUP,
          },
        },
        orderBy: { id: 'asc' },
      });

      const qualifiedParticipantIds: bigint[] = [];
      for (const g of groupsWithStandings) {
        for (const s of g.standing) {
          qualifiedParticipantIds.push(s.participantId as bigint);
        }
      }

      if (qualifiedParticipantIds.length < 2) {
        throw new BadRequestException(
          'Not enough qualified teams to start knockout',
        );
      }

      const qualifiedParticipants = await this.prisma.participant.findMany({
        where: { id: { in: qualifiedParticipantIds } },
        include: { team: true, player: { include: { user: true } } },
      });

      shuffleArray(qualifiedParticipants);

      const createdMatches: AllMatchResponseDto[] = [];
      await this.prisma.$transaction(async (tx) => {
        for (let i = 0; i < qualifiedParticipants.length; i += 2) {
          const p1 = qualifiedParticipants[i];
          const p2 = qualifiedParticipants[i + 1] ?? null;

          const m = await tx.match.create({
            data: {
              competition_id: competitionId,
              participant1_id: p1.id,
              participant2_id: p2?.id ?? null,
              round: 1,
              stage: 'KNOCKOUT',
              status: p2 ? 'SCHEDULED' : 'COMPLETED',
              winner_participant_id: p2 ? null : p1.id,
            },
            include: {
              participant1: {
                include: { team: true, player: { include: { user: true } } },
              },
              participant2: {
                include: { team: true, player: { include: { user: true } } },
              },
            },
          });

          createdMatches.push(mapMatchToDto(m));
        }

        await tx.competition.update({
          where: { id: competitionId },
          data: { hasGroupStage: false, eliminationType: 'KNOCKOUT' },
        });
      });

      return {
        success: true,
        message: 'First round knockout matches generated from group winners',
        data: createdMatches,
      };
    }

    if (competition.matches.length > 0)
      throw new BadRequestException('Knockout matches already generated');

    const participants = competition.participants.filter(
      (p) => p.status === 'ACCEPTED',
    );
    if (participants.length < 2)
      throw new BadRequestException(
        'Not enough participants to start knockout',
      );

    shuffleArray(participants);

    const createdMatches: AllMatchResponseDto[] = [];
    await this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < participants.length; i += 2) {
        const p1 = participants[i];
        const p2 = participants[i + 1] ?? null;

        const match = await tx.match.create({
          data: {
            competition_id: competitionId,
            participant1_id: p1.id,
            participant2_id: p2?.id ?? null,
            round: 1,
            stage: 'KNOCKOUT',
            status: getMatchStatus(p2),
            winner_participant_id: p2 ? null : p1.id,
          },
          include: {
            participant1: {
              include: { team: true, player: { include: { user: true } } },
            },
            participant2: {
              include: { team: true, player: { include: { user: true } } },
            },
          },
        });

        createdMatches.push(mapMatchToDto(match));
      }

      await tx.competition.update({
        where: { id: competitionId },
        data: { eliminationType: 'KNOCKOUT', hasGroupStage: false },
      });
    });

    return {
      success: true,
      message: 'First round knockout matches generated',
      data: createdMatches,
    };
  }

  async generateSecondRound(competitionId: bigint, userId: bigint) {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId, organization_id: userId },
      include: {
        matches: { where: { round: { not: null } } },
        participants: {
          include: { team: true, player: { include: { user: true } } },
        },
        groups: true,
      },
    });
    if (!competition) throw new NotFoundException('Competition not found');

    const completedMatches = competition.matches.filter(
      (m) => m.status === 'COMPLETED',
    );
    if (completedMatches.length === 0)
      throw new BadRequestException('No completed matches available');

    const lastRound = Math.max(...completedMatches.map((m) => m.round!));
    if (competition.matches.some((m) => m.round === lastRound + 1))
      throw new BadRequestException(
        `Knockout round ${lastRound + 1} already exists`,
      );

    const participantMap = new Map(
      competition.participants.map((p) => [p.id, p]),
    );
    const winners = completedMatches
      .filter((m) => m.round === lastRound && m.winner_participant_id)
      .map((m) => participantMap.get(m.winner_participant_id!))
      .filter(Boolean) as typeof competition.participants;

    if (winners.length < 2) throw new BadRequestException('Competition end');

    shuffleArray(winners);

    const createdMatches: AllMatchResponseDto[] = [];
    await this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < winners.length; i += 2) {
        const p1 = winners[i];
        const p2 = winners[i + 1] ?? null;

        const match = await tx.match.create({
          data: {
            competition_id: competitionId,
            participant1_id: p1.id,
            participant2_id: p2?.id ?? null,
            round: lastRound + 1,
            stage: getMatchStage(winners.length),
            status: getMatchStatus(p2),
            winner_participant_id: p2 ? null : p1.id,
          },
          include: {
            participant1: {
              include: { team: true, player: { include: { user: true } } },
            },
            participant2: {
              include: { team: true, player: { include: { user: true } } },
            },
          },
        });

        createdMatches.push(mapMatchToDto(match));
      }
    });

    return {
      success: true,
      message: `Knockout round ${lastRound + 1} generated`,
      data: createdMatches,
    };
  }
}
