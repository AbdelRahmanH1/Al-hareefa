import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMatchRequestDto } from './dto/request/createMatchRequest.dto';
import { UpadateMatchRequestDto } from './dto/request/updateMatchRequest.dto';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { AllMatchResponseDto } from './dto/response/allMatchsResponse.dto';
import { SetMatchResultDto } from '../dto/request/SetMatchRequest.dto';
import { updateGroupStanding } from 'src/shared/helpers/calculateStandings.util';
import { mapMatchToDto } from 'src/shared/helpers/match.mapper';
import {
  getMatchStage,
  getMatchStatus,
  shuffleArray,
} from 'src/shared/helpers/match.helper';
import { Competition, Participant } from '@prisma/client';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  // -----------------------------
  // Create a manual match
  // -----------------------------
  async createMatchManually(
    userId: bigint,
    competitionId: bigint,
    data: CreateMatchRequestDto,
  ): Promise<ResponseDto<AllMatchResponseDto>> {
    const competition = await this.prisma.competition.findUnique({
      where: {
        id: competitionId,
        organization_id: userId,
        approval_status: 'ACCEPTED',
      },
      include: {
        participants: {
          include: { team: true, player: { include: { user: true } } },
        },
      },
    });

    if (!competition)
      throw new NotFoundException('Competition not found or not approved');

    const [p1Id, p2Id] = [
      BigInt(data.participant1Id),
      BigInt(data.participant2Id),
    ];
    if (p1Id === p2Id)
      throw new BadRequestException(
        'A participant cannot play against themselves',
      );

    await this.validateParticipants(competition, [p1Id, p2Id]);
    await this.checkDuplicateMatch(competitionId, p1Id, p2Id);

    if (data.scheduledAt)
      await this.checkScheduleConflict(
        competitionId,
        [p1Id, p2Id],
        new Date(data.scheduledAt),
      );

    const match = await this.prisma.match.create({
      data: {
        competition_id: competitionId,
        participant1_id: p1Id,
        participant2_id: p2Id,
        stage: data.stage,
        status: 'SCHEDULED',
        scheduled_at: data.scheduledAt ? new Date(data.scheduledAt) : null,
        venue_name: data.venueName ?? null,
        venue_address: data.venueAddress ?? null,
        venue_city: data.venueCity ?? null,
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

    return {
      success: true,
      message: 'Match created successfully',
      data: mapMatchToDto(match),
    };
  }

  // -----------------------------
  // Get all matches by competition
  // -----------------------------
  async getMatchesByCompetitionId(
    competitionId: bigint,
  ): Promise<ResponseDto<AllMatchResponseDto[]>> {
    const matches = await this.prisma.match.findMany({
      where: { competition_id: competitionId },
      include: {
        participant1: {
          include: { team: true, player: { include: { user: true } } },
        },
        participant2: {
          include: { team: true, player: { include: { user: true } } },
        },
      },
      orderBy: { scheduled_at: 'desc' },
    });

    return {
      success: true,
      message: 'Matches fetched successfully',
      data: matches.map(mapMatchToDto),
    };
  }

  // -----------------------------
  // Generate first knockout round
  // -----------------------------
  async generateKnockoutFirstRound(
    competitionId: bigint,
    userId: bigint,
  ): Promise<ResponseDto<AllMatchResponseDto[]>> {
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
      },
    });

    if (!competition)
      throw new BadRequestException('Competition not found or unauthorized');
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
    });

    return {
      success: true,
      message: 'First round knockout matches generated',
      data: createdMatches,
    };
  }

  // -----------------------------
  // Generate next knockout round
  // -----------------------------
  async generateNextKnockoutRound(
    competitionId: bigint,
    userId: bigint,
  ): Promise<ResponseDto<AllMatchResponseDto[]>> {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId, organization_id: userId },
      include: {
        matches: { where: { round: { not: null } } },
        participants: {
          include: { team: true, player: { include: { user: true } } },
        },
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

    if (winners.length < 2)
      throw new BadRequestException('Not enough winners to create next round');

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

  // -----------------------------
  // Update match
  // -----------------------------
  async updateMatch(
    matchId: bigint,
    userId: bigint,
    data: UpadateMatchRequestDto,
  ): Promise<ResponseDto<AllMatchResponseDto>> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        competition: { include: { participants: true } },
        participant1: {
          include: { team: true, player: { include: { user: true } } },
        },
        participant2: {
          include: { team: true, player: { include: { user: true } } },
        },
      },
    });
    if (!match) throw new NotFoundException('Match not found');
    if (match.competition.organization_id !== userId)
      throw new UnauthorizedException('Not owner of competition');
    if (match.status === 'COMPLETED')
      throw new BadRequestException('Cannot update completed match');

    const newP1 = BigInt(data.participant1Id ?? match.participant1_id);
    const newP2 = data.participant2Id
      ? BigInt(data.participant2Id)
      : match.participant2_id;
    if (newP1 === newP2)
      throw new BadRequestException('Participants cannot be same');

    await this.validateParticipants(
      match.competition,
      [newP1, newP2].filter(Boolean) as bigint[],
    );
    await this.checkDuplicateMatch(
      match.competition_id,
      newP1,
      newP2!,
      match.id,
    );

    if (data.scheduledAt)
      await this.checkScheduleConflict(
        match.competition_id,
        [newP1, newP2!],
        new Date(data.scheduledAt),
        match.id,
      );

    const updatedMatch = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        participant1_id: newP1,
        participant2_id: newP2,
        scheduled_at: data.scheduledAt
          ? new Date(data.scheduledAt)
          : match.scheduled_at,
        venue_name: data.venueName ?? match.venue_name,
        venue_address: data.venueAddress ?? match.venue_address,
        venue_city: data.venueCity ?? match.venue_city,
        stage: data.stage ?? match.stage,
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

    return {
      success: true,
      message: 'Match updated successfully',
      data: mapMatchToDto(updatedMatch),
    };
  }

  // -----------------------------
  // Set match result
  // -----------------------------
  async setMatchResult(
    userId: bigint,
    matchId: bigint,
    data: SetMatchResultDto,
  ): Promise<ResponseDto<any>> {
    const { scoreParticipant1, scoreParticipant2 } = data;

    const updatedMatch = await this.prisma.$transaction(async (prisma) => {
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        select: {
          id: true,
          competition: { select: { organization_id: true } },
          status: true,
          stage: true,
          group_id: true,
          participant1_id: true,
          participant2_id: true,
          participant1: {
            select: {
              id: true,
              player: {
                select: { user: { select: { id: true, full_name: true } } },
              },
            },
          },
          participant2: {
            select: {
              id: true,
              player: {
                select: { user: { select: { id: true, full_name: true } } },
              },
            },
          },
        },
      });

      if (!match) throw new NotFoundException('Match not found');
      if (match.competition.organization_id !== userId)
        throw new ForbiddenException('Not authorized');
      if (match.status === 'COMPLETED')
        throw new BadRequestException('Result already set');
      if (
        match.stage !== 'GROUP_STAGE' &&
        scoreParticipant1 === scoreParticipant2
      )
        throw new BadRequestException('Draw not allowed');

      const winnerId =
        scoreParticipant1 === scoreParticipant2
          ? null
          : scoreParticipant1 > scoreParticipant2
            ? match.participant1_id
            : match.participant2_id;

      const updated = await prisma.match.update({
        where: { id: matchId },
        data: {
          score_participant1: scoreParticipant1,
          score_participant2: scoreParticipant2,
          winner_participant_id: winnerId,
          status: 'COMPLETED',
        },
        select: {
          id: true,
          stage: true,
          status: true,
          participant1: {
            select: {
              id: true,
              player: {
                select: { user: { select: { id: true, full_name: true } } },
              },
            },
          },
          participant2: {
            select: {
              id: true,
              player: {
                select: { user: { select: { id: true, full_name: true } } },
              },
            },
          },
          score_participant1: true,
          score_participant2: true,
          winner_participant_id: true,
          competition_id: true,
        },
      });

      if (match.stage === 'GROUP_STAGE' && match.group_id) {
        await updateGroupStanding({
          prisma: this.prisma,
          matchId: match.id,
          scoreParticipant1,
          scoreParticipant2,
          participant1Id: match.participant1_id!,
          participant2Id: match.participant2_id!,
          groupId: match.group_id!,
        });
      }
      if (!updated.participant1 || !updated.participant2) {
        throw new Error('Participants not found');
      }

      return {
        id: updated.id.toString(),
        competitionId: updated.competition_id.toString(),
        stage: updated.stage,
        status: updated.status,
        participant1: {
          id: updated.participant1.id,
          name: updated.participant1.player?.user?.full_name ?? 'Unknown',
        },
        participant2: {
          id: updated?.participant2.id ?? 0,
          name: updated.participant2?.player?.user?.full_name ?? 'Unknown',
        },
        scoreParticipant1: updated.score_participant1,
        scoreParticipant2: updated.score_participant2,
        winnerParticipantId: updated.winner_participant_id?.toString() ?? null,
      };
    });

    return {
      success: true,
      message: 'Match result set successfully',
      data: updatedMatch,
    };
  }

  // -----------------------------
  // Private helpers
  // -----------------------------
  private async validateParticipants(
    competition: Competition & { participants: Participant[] },
    participantIds: bigint[],
  ) {
    const participantSet = new Set(
      competition?.participants.map((p) => p.id.toString()) ?? [],
    );
    for (const id of participantIds) {
      if (!participantSet.has(id.toString()))
        throw new BadRequestException('Participant not in competition');
    }
    return competition;
  }

  private async checkDuplicateMatch(
    competitionId: bigint,
    p1: bigint,
    p2: bigint,
    excludeMatchId?: bigint,
  ) {
    const existingMatch = await this.prisma.match.findFirst({
      where: {
        competition_id: competitionId,
        id: excludeMatchId ? { not: excludeMatchId } : undefined,
        OR: [
          { participant1_id: p1, participant2_id: p2 },
          { participant1_id: p2, participant2_id: p1 },
        ],
      },
    });
    if (existingMatch) throw new ConflictException('Duplicate match exists');
  }

  private async checkScheduleConflict(
    competitionId: bigint,
    participantIds: bigint[],
    scheduledAt: Date,
    excludeMatchId?: bigint,
  ) {
    const orConditions = participantIds.flatMap((id) => [
      { participant1_id: id },
      { participant2_id: id },
    ]);

    const conflict = await this.prisma.match.findFirst({
      where: {
        competition_id: competitionId,
        scheduled_at: scheduledAt,
        id: excludeMatchId ? { not: excludeMatchId } : undefined,
        OR: orConditions.length > 0 ? orConditions : undefined,
      },
    });

    if (conflict)
      throw new ConflictException('Scheduling conflict for participant(s)');
  }
}
