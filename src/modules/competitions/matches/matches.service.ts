import {
  BadRequestException,
  ConflictException,
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
import { mapMatchToDto } from 'src/shared/helpers/match.mapper';
import { KnockoutService } from './knockout.service';
import { ResultService } from './results.service';
import { MatchUtil } from './utils/validation.helper';
import { SetMatchScheduleDto } from './dto/request/setMatchDateRequest.dto';

@Injectable()
export class MatchesService {
  private readonly matchUtils: MatchUtil;
  constructor(
    private readonly prisma: PrismaService,
    private readonly knockoutService: KnockoutService,
    private readonly resultSerice: ResultService,
  ) {
    this.matchUtils = new MatchUtil(prisma);
  }

  // -----------------------------
  // Create a manual match
  // -----------------------------
  async createMatchManually(
    userId: bigint,
    competitionId: bigint,
    data: CreateMatchRequestDto,
  ): Promise<ResponseDto<AllMatchResponseDto>> {
    const competition = await this.prisma.competition.findFirst({
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

    await this.matchUtils.validateParticipants(competition, [p1Id, p2Id]);
    await this.matchUtils.checkDuplicateMatch(competitionId, p1Id, p2Id);

    if (data.scheduledAt)
      await this.matchUtils.checkScheduleConflict(
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
    return this.knockoutService.generateFirstRound(competitionId, userId);
  }

  // -----------------------------
  // Generate next knockout round
  // -----------------------------
  async generateNextKnockoutRound(
    competitionId: bigint,
    userId: bigint,
  ): Promise<ResponseDto<AllMatchResponseDto[]>> {
    return this.knockoutService.generateSecondRound(competitionId, userId);
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

    await this.matchUtils.validateParticipants(
      match.competition,
      [newP1, newP2].filter(Boolean) as bigint[],
    );
    await this.matchUtils.checkDuplicateMatch(
      match.competition_id,
      newP1,
      newP2!,
      match.id,
    );

    if (data.scheduledAt)
      await this.matchUtils.checkScheduleConflict(
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
    return this.resultSerice.setResult(userId, matchId, data);
  }

  async setMatchSchedule(matchId: bigint, data: SetMatchScheduleDto) {
    const { scheduledAt } = data;

    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate.getTime() < Date.now()) {
      throw new BadRequestException('Cannot schedule a match in the past');
    }

    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      select: { id: true, status: true },
    });

    if (!match) throw new NotFoundException('Match not found');
    if (match.status === 'COMPLETED')
      throw new BadRequestException('Cannot schedule a completed match');

    const updatedMatch = await this.prisma.match.update({
      where: { id: matchId },
      data: { scheduled_at: scheduledAt },
    });

    return {
      success: true,
      message: 'Match scheduled successfully',
      data: updatedMatch,
    };
  }
}
