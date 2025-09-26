import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { getCompetitionStatus } from 'src/shared/helpers/competition-status.util';
import { ParticipantResponseDto } from './dto/Participant-response.dto';
import { plainToInstance } from 'class-transformer';
import { Participant, ParticipantType } from '@prisma/client';
import { isSoloCompetition } from 'src/shared/helpers/isSoloCompetition.util';
import { canCancelParticipation } from 'src/shared/helpers/canCancelParticipation.util';
import { database } from 'firebase-admin';

@Injectable()
export class ParticipantsService {
  constructor(private readonly prisma: PrismaService) {}

  private async validateCompetitionForRegistration(competitionId: bigint) {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
      include: { type: true },
    });

    if (!competition || competition.approval_status !== 'ACCEPTED') {
      throw new NotFoundException('Competition not found or not approved');
    }

    const competitionDateStatus = getCompetitionStatus(
      competition.start_date,
      competition.end_date,
    );

    if (competitionDateStatus !== 'UPCOMING') {
      throw new BadRequestException('Competition is not open for registration');
    }
    return competition;
  }

  async registerPlayer(
    playerId: bigint,
    competitionId: bigint,
  ): Promise<ResponseDto<ParticipantResponseDto>> {
    const competition =
      await this.validateCompetitionForRegistration(competitionId);

    if (competition.type.min_player_per_team > 1) {
      throw new BadRequestException(
        'This competition requires a team, not individual players',
      );
    }
    const existing = await this.prisma.participant.findUnique({
      where: {
        competition_id_player_id: {
          competition_id: competitionId,
          player_id: playerId,
        },
      },
    });

    if (existing) throw new BadRequestException('Already registered');

    const participant = await this.prisma.$transaction(async (tx) => {
      const total = await tx.participant.count({
        where: {
          competition_id: competitionId,
          status: 'ACCEPTED',
        },
      });

      if (total == competition.max_teams) {
        throw new BadRequestException('Competition is full');
      }

      if (competition.fee_amount === 0) {
        return tx.participant.create({
          data: {
            competition_id: competitionId,
            player_id: playerId,
            type: 'PLAYER',
            status: 'ACCEPTED',
          },
        });
      } else {
        return tx.participant.create({
          data: {
            competition_id: competitionId,
            player_id: playerId,
            type: 'PLAYER',
            status: 'PENDING',
          },
        });
      }
    });

    const response = plainToInstance(ParticipantResponseDto, participant, {
      excludeExtraneousValues: true,
    });

    return {
      success: true,
      message:
        competition.fee_amount == 0
          ? 'Player registered successfully'
          : 'Player registered successfully, payment required',
      data: response,
    };
  }

  async registerTeam(
    userId: bigint,
    teamId: bigint,
    competitionId: bigint,
  ): Promise<ResponseDto<ParticipantResponseDto>> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId, created_by_id: userId, is_deleted: false },
    });

    if (!team) throw new NotFoundException('Team not found');
    const competition =
      await this.validateCompetitionForRegistration(competitionId);

    if (
      competition.type.min_player_per_team === 1 &&
      competition.type.max_player_per_team === 1
    ) {
      throw new BadRequestException(
        'This competition is for individual players only, not teams',
      );
    }
    const existing = await this.prisma.participant.findUnique({
      where: {
        competition_id_team_id: {
          team_id: teamId,
          competition_id: competitionId,
        },
      },
    });

    if (existing) throw new BadRequestException('Team already registered');

    const participant = await this.prisma.$transaction(async (tx) => {
      const total = await tx.participant.count({
        where: {
          competition_id: competitionId,
          status: 'ACCEPTED',
        },
      });
      if (total == competition.max_teams) {
        throw new BadRequestException('Competition is full');
      }
      if (competition.fee_amount === 0) {
        return tx.participant.create({
          data: {
            competition_id: competitionId,
            team_id: teamId,
            type: 'TEAM',
            status: 'ACCEPTED',
          },
        });
      } else {
        return tx.participant.create({
          data: {
            competition_id: competitionId,
            team_id: teamId,
            type: ParticipantType.TEAM,
            status: 'PENDING',
          },
        });
      }
    });
    const response = plainToInstance(ParticipantResponseDto, participant, {
      excludeExtraneousValues: true,
    });
    return {
      success: true,
      message: 'Team registered successfully',
      data: response,
    };
  }

  async cancelParticipation(competitionId: bigint, userId: bigint) {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
      include: { type: true },
    });

    if (!competition) throw new BadRequestException('Competition not found');
    if (competition.end_date < new Date())
      throw new BadRequestException('Competition already ended');

    let participant: Participant | null = null;

    if (isSoloCompetition(competition)) {
      participant = await this.prisma.participant.findFirst({
        where: {
          competition_id: competitionId,
          player_id: userId,
        },
      });
    } else {
      const team = await this.prisma.team.findFirst({
        where: { created_by_id: userId },
      });

      if (!team) throw new NotFoundException('Team not found');

      participant = await this.prisma.participant.findFirst({
        where: {
          competition_id: competitionId,
          team_id: team.id,
        },
      });
    }
    if (!participant) {
      throw new NotFoundException('Participation not found');
    }

    if (!canCancelParticipation(participant, competition)) {
      throw new BadRequestException(
        'Cannot cancel participation at this stage',
      );
    }
    await this.prisma.participant.delete({ where: { id: participant.id } });
    return {
      success: true,
      message: 'Participation cancelled successfully',
      data: null,
    };
  }
}
