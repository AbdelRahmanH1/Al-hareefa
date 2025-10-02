import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTeamRequest } from './dto/request/CreateTeam.dto';
import { UpdateTeamRequest } from './dto/request/UpdateTeam.dto';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { TeamResponseDto } from './dto/response/Team-response.dto';
import { PaginatedTeamsResponseDto } from './dto/response/PaginatedTeams-response.dto';
import { UserRole } from '@prisma/client';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTeam(
    request: CreateTeamRequest,
    userId: bigint,
    role: UserRole,
  ): Promise<ResponseDto<TeamResponseDto>> {
    // Check if team name exists
    const isNameExists = await this.prisma.team.findUnique({
      where: { name: request.name },
    });
    if (isNameExists) throw new BadRequestException('This name already exists');

    const newTeam = await this.prisma.team.create({
      data: {
        ...request,
        created_by_id: userId,
        created_by_role: role,
        members: {
          create: [
            {
              userId: userId,
              roleInTeam: 'CAPTAIN',
              invitedAt: new Date(),
              respondedAt: new Date(),
            },
          ],
        },
      },
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    const response = plainToInstance(TeamResponseDto, newTeam, {
      excludeExtraneousValues: true,
    });

    return {
      success: true,
      message: 'Team created successfully',
      data: response,
    };
  }

  async updateTeam(
    teamId: bigint,
    userId: bigint,
    request: UpdateTeamRequest,
  ): Promise<ResponseDto<TeamResponseDto>> {
    const dataToUpdate = Object.fromEntries(
      Object.entries(request).filter(
        ([_, value]) => value != undefined && value != null && value !== '',
      ),
    );

    if (Object.keys(dataToUpdate).length === 0)
      throw new BadRequestException('No data provided to update');

    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });
    if (!team) throw new NotFoundException('Team not found');
    if (team.created_by_id !== userId)
      throw new UnauthorizedException('You do not own this team');

    if (request.name && request.name !== team.name) {
      const nameExists = await this.prisma.team.findUnique({
        where: { name: request.name },
      });
      if (nameExists) throw new BadRequestException('Team name already exists');
    }

    const updatedTeam = await this.prisma.team.update({
      where: { id: teamId },
      data: dataToUpdate,
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    const response = plainToInstance(TeamResponseDto, updatedTeam, {
      excludeExtraneousValues: true,
    });

    return {
      success: true,
      message: 'Team updated successfully',
      data: response,
    };
  }

  async softDeleteTeam(teamId: bigint, userId: bigint) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });
    if (!team) throw new NotFoundException('Team not found');
    if (team.created_by_id !== userId)
      throw new UnauthorizedException('You do not own this team');

    // Check if team is in ongoing competition
    const activeParticipation = await this.prisma.participant.findFirst({
      where: {
        team_id: teamId,
        competition: { end_date: { gt: new Date() } },
      },
    });
    if (activeParticipation)
      throw new BadRequestException(
        'Team is participating in an ongoing competition',
      );

    await this.prisma.team.update({
      where: { id: teamId },
      data: { is_deleted: true },
    });

    return { message: 'Team deleted successfully' };
  }

  async getTeams(
    userId: bigint,
    page: number = 1,
    limit: number = 10,
    owned?: boolean,
  ): Promise<ResponseDto<PaginatedTeamsResponseDto>> {
    const skip = (page - 1) * limit;

    const whereClause = owned
      ? { is_deleted: false, created_by_id: userId }
      : {
          is_deleted: false,
          OR: [
            { created_by_id: userId },
            { members: { some: { userId: userId } } },
          ],
        };

    const teams = await this.prisma.team.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        members: { include: { user: true } },
      },
    });

    const total = await this.prisma.team.count({ where: whereClause });

    const paginatedResponse: PaginatedTeamsResponseDto = {
      items: teams.map((team) => ({
        id: team.id.toString(),
        name: team.name,
        logo: team.logo,
        game: team.game,
        members: team.members.map((m) => ({
          id: m.user.id.toString(),
          full_name: m.user.full_name,
          roleInTeam: m.roleInTeam,
        })),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    return {
      success: true,
      message: 'Teams fetched successfully',
      data: paginatedResponse,
    };
  }

  async searchTeam({
    teamId,
    name,
  }: {
    teamId?: bigint;
    name?: string;
  }): Promise<ResponseDto<TeamResponseDto>> {
    if (!teamId && !name)
      throw new BadRequestException('teamId or name must be provided');

    const team = await this.prisma.team.findFirst({
      where: {
        ...(teamId && { id: teamId }),
        ...(name && { name }),
        is_deleted: false,
      },
      include: {
        members: { include: { user: true } },
      },
    });

    if (!team) throw new NotFoundException('Team not found');

    const teamResponse = plainToInstance(
      TeamResponseDto,
      {
        id: team.id.toString(),
        name: team.name,
        logo: team.logo,
        game: team.game,
        members: team.members.map((m) => ({
          id: m.user.id.toString(),
          full_name: m.user.full_name,
          roleInTeam: m.roleInTeam,
        })),
      },
      { excludeExtraneousValues: true },
    );

    return {
      success: true,
      message: 'Team fetched successfully',
      data: teamResponse,
    };
  }
}
