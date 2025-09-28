import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGroupManualDto } from './dto/request/CreateGroupManual.dto';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { plainToInstance } from 'class-transformer';
import { GroupResponseDto } from './dto/response/GroupResponse.dto';
import { GenerateGroupsDto } from './dto/request/GenerateGroups.dto';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async createGroupManual(
    userId: bigint,
    competitionId: bigint,
    dto: CreateGroupManualDto,
  ): Promise<ResponseDto<GroupResponseDto>> {
    const competition = await this.prisma.competition.findUnique({
      where: {
        id: competitionId,
        organization_id: userId,
        approval_status: 'ACCEPTED',
      },
    });
    if (!competition) throw new Error('Competition not found');

    // check participants already assigned to a group in this competition
    const alreadyAssigned = await this.prisma.groupMembership.findMany({
      where: {
        participant_id: { in: dto.participantIds },
        group: { competition_id: competitionId },
      },
      include: { group: true },
    });
    if (alreadyAssigned.length > 0) {
      throw new BadRequestException(
        `Some participants are already assigned to a group in this competition.`,
      );
    }
    // generate group names

    const groupCount = await this.prisma.competitionGroup.count({
      where: { competition_id: competitionId },
    });

    const groupName = `Group ${String.fromCharCode(65 + groupCount)}`;

    const result = await this.prisma.$transaction(async (tx) => {
      const group = await tx.competitionGroup.create({
        data: {
          name: groupName,
          competition_id: competitionId,
        },
      });

      if (dto.participantIds.length > 0) {
        await tx.groupMembership.createMany({
          data: dto.participantIds.map((id) => ({
            group_id: group.id,
            participant_id: id,
          })),
        });
      }
    });
    const response = plainToInstance(GroupResponseDto, result, {
      excludeExtraneousValues: true,
    });
    return {
      success: true,
      message: 'Group created successfully',
      data: response,
    };
  }

  async getCompetitionGroups(competitionId: bigint) {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId, approval_status: 'ACCEPTED' },
    });
    if (!competition) throw new Error('Competition not found');

    const groups = await this.prisma.competitionGroup.findMany({
      where: { competition_id: competitionId },
      include: {
        members: {
          include: {
            participant: {
              include: {
                team: true,
                player: {
                  include: { user: true },
                },
              },
            },
          },
        },
      },
    });

    const response = plainToInstance(GroupResponseDto, groups, {
      excludeExtraneousValues: true,
    });

    return {
      success: true,
      message: 'Groups retrieved successfully',
      data: response,
    };
  }

  async generateGroups(
    competitionid: bigint,
    userId: bigint,
    dto: GenerateGroupsDto,
  ): Promise<ResponseDto<GroupResponseDto[]>> {
    // check groups already exist or not
    const existingGroups = await this.prisma.competitionGroup.findMany({
      where: { competition_id: competitionid },
    });
    if (existingGroups.length > 0) {
      throw new BadRequestException(
        'Groups already exist for this competition',
      );
    }

    const competition = await this.prisma.competition.findUnique({
      where: {
        id: competitionid,
        organization_id: userId,
        approval_status: 'ACCEPTED',
      },
      include: { participants: true },
    });
    if (!competition) throw new Error('Competition not found');

    const participants = competition.participants.filter(
      (p) => p.status === 'ACCEPTED',
    );

    if (participants.length < dto.numberOfGroups * dto.participantsPerGroup) {
      throw new BadRequestException(
        'Not enough participants to fill the groups',
      );
    }

    // shuffle participants
    const shuffled = [...participants].sort(() => Math.random() - 0.5);

    // create groups and assign participants
    let index = 0;
    for (let i = 1; i <= dto.numberOfGroups; i++) {
      const group = await this.prisma.competitionGroup.create({
        data: {
          name: `Group ${String.fromCharCode(64 + i)}`,
          competition_id: competitionid,
        },
      });
      for (
        let j = 0;
        j < dto.participantsPerGroup && index < shuffled.length;
        j++
      ) {
        const participant = shuffled[index++];
        await this.prisma.groupMembership.create({
          data: {
            group_id: group.id,
            participant_id: participant.id,
          },
        });
      }
    }
    const groups = await this.prisma.competitionGroup.findMany({
      where: { competition_id: competitionid },
      include: {
        members: {
          include: {
            participant: {
              include: {
                team: true,
                player: true,
              },
            },
          },
        },
      },
    });

    const response = plainToInstance(GroupResponseDto, groups, {
      excludeExtraneousValues: true,
    });
    return {
      success: true,
      message: 'Groups generated successfully',
      data: response,
    };
  }
}
