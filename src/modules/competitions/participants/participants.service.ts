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
import { Participant, ParticipantType, Payment } from '@prisma/client';
import { isSoloCompetition } from 'src/shared/helpers/isSoloCompetition.util';
import { canCancelParticipation } from 'src/shared/helpers/canCancelParticipation.util';
import { database } from 'firebase-admin';
import { log } from 'console';

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

    if (
      competition.type.min_player_per_team > 1 ||
      competition.type.max_player_per_team > 1
    ) {
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

      if (competition.max_teams !== null && total >= competition.max_teams) {
        throw new BadRequestException('Competition is full');
      }

      const participant = await tx.participant.create({
        data: {
          competition_id: competitionId,
          player_id: playerId,
          type: 'PLAYER',
          status: competition.fee_amount === 0 ? 'ACCEPTED' : 'PENDING',
        },
      });

      if (competition.fee_amount && competition.fee_amount > 0) {
        await tx.payment.create({
          data: {
            participant_id: participant.id,
            amount: competition.fee_amount,
            status: 'PENDING',
            created_at: new Date(),
            user_id: playerId,
          },
        });
      }

      return participant;
    });

    const response = plainToInstance(ParticipantResponseDto, participant, {
      excludeExtraneousValues: true,
    });

    return {
      success: true,
      message:
        competition.fee_amount === 0
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
        where: { competition_id: competitionId, status: 'ACCEPTED' },
      });

      if (competition.max_teams !== null && total >= competition.max_teams) {
        throw new BadRequestException('Competition is full');
      }

      const participant = await tx.participant.create({
        data: {
          competition_id: competitionId,
          team_id: teamId,
          type: ParticipantType.TEAM,
          status:
            competition.fee_amount && competition.fee_amount > 0
              ? 'PENDING'
              : 'ACCEPTED',
        },
      });

      if (competition.fee_amount && competition.fee_amount > 0) {
        await tx.payment.create({
          data: {
            participant_id: participant.id,
            amount: competition.fee_amount,
            status: 'PENDING',
            created_at: new Date(),
            user_id: userId,
          },
        });
      }

      return participant;
    });

    const response = plainToInstance(ParticipantResponseDto, participant, {
      excludeExtraneousValues: true,
    });

    return {
      success: true,
      message:
        competition.fee_amount && competition.fee_amount > 0
          ? 'Team registered successfully, payment required'
          : 'Team registered successfully',
      data: response,
    };
  }

  async cancelParticipation(
    userId: bigint,
    competitionId: bigint,
  ): Promise<ResponseDto<null>> {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
      include: { type: true },
    });

    if (!competition) throw new NotFoundException('Competition not found');
    if (competition.end_date < new Date()) {
      throw new BadRequestException('Competition already ended');
    }

    let participant: (Participant & { payments: Payment[] }) | null = null;

    if (isSoloCompetition(competition)) {
      participant = await this.prisma.participant.findFirst({
        where: { competition_id: competitionId, player_id: userId },
        include: { payments: true },
      });
    } else {
      const team = await this.prisma.team.findFirst({
        where: { created_by_id: userId, is_deleted: false },
      });
      if (!team) throw new NotFoundException('Team not found');

      participant = await this.prisma.participant.findFirst({
        where: { competition_id: competitionId, team_id: team.id },
        include: { payments: true },
      });
    }
    if (!participant) throw new NotFoundException('Participation not found');

    if (participant.status === 'REJECTED') {
      throw new BadRequestException('Participation already cancelled');
    }

    if (competition.fee_type === 'FREE') {
      if (competition.start_date > new Date()) {
        await this.prisma.participant.delete({ where: { id: participant.id } });
        return {
          success: true,
          message: 'Participation cancelled successfully',
          data: null,
        };
      }
      throw new BadRequestException(
        'Cannot cancel free participation after approval',
      );
    }

    if (competition.fee_type === 'PAID') {
      const successPayment = participant.payments?.find(
        (p) => p.status === 'COMPLETED',
      );
      if (successPayment) {
        throw new BadRequestException(
          'Cannot cancel participation with completed payment',
        );
      }

      const pendingPayment = participant.payments?.find(
        (p) => p.status === 'PENDING',
      );

      if (pendingPayment && participant.status === 'PENDING') {
        await this.prisma.$transaction([
          this.prisma.payment.delete({ where: { id: pendingPayment.id } }),
          this.prisma.participant.delete({ where: { id: participant.id } }),
        ]);
        return {
          success: true,
          message: 'Participation cancelled successfully',
          data: null,
        };
      }

      throw new BadRequestException(
        'Cannot cancel participation: no cancellable payment found',
      );
    }

    throw new BadRequestException('Invalid competition fee type');
  }
}
