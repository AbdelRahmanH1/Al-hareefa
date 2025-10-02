import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { CompetitionResponseDto } from './dto/response/Competition-response.dto';
import { CreateCompetitionRequestDto } from './dto/request/CreateCompetition-request.dto';
import { plainToInstance } from 'class-transformer';
import {
  ApprovalStatus,
  EliminationType,
  FeeType,
  GameType,
} from '@prisma/client';
import { GetCompetitionsFilterDto } from './dto/request/GetCompetitionsFilter.dto';
import { PaginatedDataDto } from 'src/shared/dto/PaginatedData.dto';
import { getCompetitionStatus } from 'src/shared/helpers/competition-status.util';

@Injectable()
export class CompetitionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createCompetition(
    organizer_id: bigint,
    data: CreateCompetitionRequestDto,
  ): Promise<ResponseDto<CompetitionResponseDto>> {
    // -------------------- Organizer Validation --------------------
    const organizer = await this.prisma.organizationProfile.findFirst({
      where: { user_id: organizer_id, approval_status: 'ACCEPTED' },
    });
    if (!organizer) {
      throw new BadRequestException('Organizer is not active or approved');
    }

    // -------------------- Competition Name Validation --------------------
    const existing = await this.prisma.competition.findFirst({
      where: { name: data.name },
    });
    if (existing) {
      throw new BadRequestException('Competition name already exists');
    }

    // -------------------- Dates Validation --------------------
    if (data.end_date <= data.start_date) {
      throw new BadRequestException('End date must be after start date');
    }
    if (data.start_date < new Date()) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    // -------------------- Competition Type Validation --------------------
    const compType = await this.prisma.competitionType.findUnique({
      where: { id: data.typeId },
    });
    if (!compType) {
      throw new BadRequestException('Invalid competition type');
    }

    // -------------------- Fee Type Validation --------------------
    const fee_type: FeeType =
      data.fee_amount && data.fee_amount > 0 ? 'PAID' : 'FREE';
    // -------------------- Competition Creation --------------------
    const competition = await this.prisma.competition.create({
      data: {
        name: data.name,
        typeId: data.typeId,
        start_date: data.start_date,
        end_date: data.end_date,
        venue_name: data.venue_name,
        venue_address: data.venue_address,
        venue_city: data.venue_city,
        fee_type: fee_type,
        fee_amount: data.fee_amount ?? null,
        min_age: data.min_age ?? 7,
        max_age: data.max_age ?? 35,
        max_teams: data.max_teams ?? null,
        eliminationType: data.eliminationType ?? 'SINGLE_ELIMINATION',
        hasGroupStage: data.eliminationType === 'KNOCKOUT',
        approval_status: 'PENDING',
        organization_id: organizer_id,
      },
    });

    // -------------------- Response --------------------
    return {
      success: true,
      message: 'Competition created successfully',
      data: plainToInstance(CompetitionResponseDto, {
        ...competition,
        organization_name: organizer.owner_name,
      }),
    };
  }

  async deleteCompetition(
    competitionId: bigint,
    organizer_id: bigint,
  ): Promise<ResponseDto<any>> {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
    });
    if (!competition) throw new BadRequestException('Competition not found');

    if (competition.organization_id !== organizer_id)
      throw new BadRequestException('You are not the owner');

    const hasParticipants = await this.prisma.participant.findFirst({
      where: {
        competition_id: competitionId,
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
    });
    if (hasParticipants)
      throw new BadRequestException('Cannot delete: participants joined');

    await this.prisma.competition.delete({ where: { id: competitionId } });

    return {
      success: true,
      message: 'Competition deleted successfully',
      data: null,
    };
  }

  async getAllCompetitions(
    page = 1,
    limit = 10,
    filters: GetCompetitionsFilterDto,
  ): Promise<ResponseDto<PaginatedDataDto<CompetitionResponseDto>>> {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters) {
      if (filters.status) where.approval_status = filters.status;
      if (filters.eliminationType)
        where.eliminationType = filters.eliminationType;
      if (filters.minAge) where.min_age = { gte: filters.minAge };
      if (filters.maxAge) where.max_age = { lte: filters.maxAge };
      if (filters.name)
        where.name = { contains: filters.name, mode: 'insensitive' };
      if (filters.sport) where.type = { sport: filters.sport };
    }

    const [competitions, total] = await Promise.all([
      this.prisma.competition.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { organization: true, type: true },
      }),
      this.prisma.competition.count({ where }),
    ]);

    const now = new Date();
    const items = competitions.map((c) =>
      plainToInstance(CompetitionResponseDto, {
        ...c,
        organization_name: c.organization.owner_name,
        status: getCompetitionStatus(c.start_date, c.end_date),
        gameType: c.type?.sport,
        isRunning: c.start_date <= now && c.end_date >= now,
      }),
    );

    return {
      success: true,
      message: 'Competitions retrieved successfully',
      data: {
        items,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getCompetitionById(
    id: bigint,
  ): Promise<ResponseDto<CompetitionResponseDto>> {
    const competition = await this.prisma.competition.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!competition) {
      throw new BadRequestException('Competition not found');
    }

    const status = getCompetitionStatus(
      competition.start_date,
      competition.end_date,
    );

    const data = plainToInstance(CompetitionResponseDto, {
      ...competition,
      organization_name: competition.organization.owner_name,
      status,
    });

    return {
      success: true,
      message: 'Competition retrieved successfully',
      data,
    };
  }

  // support functions

  async getCompetitionFilters() {
    const statuses = Object.values(ApprovalStatus);
    const eliminationTypes = Object.values(EliminationType);
    const gameTypes = Object.values(GameType);

    const organizations = await this.prisma.organizationProfile.findMany({
      select: { owner_name: true },
      distinct: ['owner_name'],
    });

    const ageRange = await this.prisma.competition.aggregate({
      _min: { min_age: true },
      _max: { max_age: true },
    });

    return {
      success: true,
      message: 'Competition filters retrieved successfully',
      data: {
        statuses,
        gameTypes,
        eliminationTypes,
        organizations: organizations.map((o) => o.owner_name),
        ageRange: {
          min: ageRange._min.min_age,
          max: ageRange._max.max_age,
        },
      },
    };
  }

  async getCompetitionOptions(): Promise<ResponseDto<any>> {
    const competitionTypes = await this.prisma.competitionType.findMany({
      select: { name: true, id: true },
    });

    return {
      success: true,
      message: 'Competition form options retrieved successfully',
      data: {
        feeTypes: Object.values(FeeType),
        eliminationTypes: Object.values(EliminationType),
        competitionTypes,
      },
    };
  }
}
