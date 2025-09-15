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

@Injectable()
export class ParticipantsService {
  constructor(private readonly prisma: PrismaService) {}

  async registerPlayer(
    playerId: bigint,
    competitionId: bigint,
  ): Promise<ResponseDto<ParticipantResponseDto>> {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
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
    if (competition.fee_amount == 0) {
      return {
        success: true,
        message: 'Player registered successfully',
        data: response,
      };
    } else {
      return {
        success: true,
        message: 'Player registered successfully, payment required',
        data: response,
      };
    }
  }
}
