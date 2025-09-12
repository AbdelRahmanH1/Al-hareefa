import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTeamRequest } from './dto/CreateTeam.dto';
import { UserRole } from '@prisma/client';
import { UpdateTeamRequest } from './dto/UpdateTeam.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTeam(request: CreateTeamRequest, userId: bigint, role: UserRole) {
    const isNameExists = await this.prisma.team.findUnique({
      where: { name: request.name },
    });
    if (isNameExists) throw new BadRequestException('This name already exists');
    const newTeam = await this.prisma.team.create({
      data: {
        ...request,
        created_by_id: userId,
        created_by_role: role,
      },
    });
    return { message: 'Team created successfully', newTeam };
  }

  async updateTeam(teamId: bigint, userId: bigint, request: UpdateTeamRequest) {
    const dataToUpdate = Object.fromEntries(
      Object.entries(request).filter(
        ([_, value]) => value != undefined && value != null && value != '',
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

    if (request.name !== team.name) {
      const nameExists = await this.prisma.team.findUnique({
        where: { name: request.name },
      });
      if (nameExists) throw new BadRequestException('Team name already exists');
    }

    const updatedTeam = await this.prisma.team.update({
      where: { id: teamId },
      data: dataToUpdate,
    });

    return { message: 'Team updated successfully', updatedTeam };
  }

  async softDeleteTeam(teamId: bigint, userId: bigint) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
      },
    });

    if (!team) throw new UnauthorizedException('Team not found');

    if (team.created_by_id !== userId)
      throw new UnauthorizedException('You do not own this team');

    const activeParticipation = await this.prisma.participant.findFirst({
      where: {
        team_id: teamId,
        competition: {
          end_date: {
            gt: new Date(),
          },
        },
      },
    });

    if (activeParticipation)
      throw new BadRequestException(
        'Team is participating in an ongoing competition',
      );

    await this.prisma.team.update({
      where: { id: teamId },
      data: {
        is_deleted: true,
      },
    });

    return {
      message: 'Team deleted successfully (soft delete)',
    };
  }

  async getTeams(
    userId: bigint,
    page: number = 1,
    limit: number = 10,
    owned?: boolean,
  ) {
    const skip = (page - 1) * limit;

    let whereClause;

    if (owned) {
      whereClause = { is_deleted: false, created_by_id: userId };
    } else {
      whereClause = {
        is_deleted: false,
        OR: [
          { created_by_id: userId },
          { members: { some: { playerId: userId } } },
        ],
      };
    }

    const teams = await this.prisma.team.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        name: true,
        logo: true,
        game: true,
        members: {
          select: owned
            ? {
                status: true,
                player: {
                  select: { user: { select: { full_name: true, id: true } } },
                },
              }
            : {
                player: {
                  select: { user: { select: { full_name: true, id: true } } },
                },
              },
        },
      },
    });

    const total = await this.prisma.team.count({ where: whereClause });

    return {
      message: 'Teams fetched successfully',
      data: {
        teams,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    };
  }

  async searchTeam({ teamId, name }: { teamId?: bigint; name?: string }) {
    if (!teamId && !name) {
      throw new BadRequestException('teamId or name must be provided');
    }
    const team = await this.prisma.team.findFirst({
      where: {
        ...(teamId && { id: teamId }),
        ...(name && { name }),
        is_deleted: false,
      },
      select: {
        name: true,
        logo: true,
        game: true,
        members: {
          select: {
            player: {
              select: { user: { select: { full_name: true, id: true } } },
            },
          },
        },
      },
    });
    if (!team) throw new NotFoundException('Team not found');
    return { message: 'get team successfully', data: { team } };
  }
}
