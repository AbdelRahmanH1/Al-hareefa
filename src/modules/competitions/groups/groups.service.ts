import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGroupManualDto } from './dto/request/CreateGroupManual.dto';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { plainToInstance } from 'class-transformer';
import { GroupResponseDto } from './dto/response/GroupResponse.dto';
import { GenerateGroupsDto } from './dto/request/GenerateGroups.dto';
import { GroupParticipantDto } from './dto/response/GroupParticipantResponse.dto';
import { GroupResponsePlainDto } from './dto/response/GroupResponsePlain.dto';
import { EliminationType } from '@prisma/client';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async createGroupManual(
    userId: bigint,
    competitionId: bigint,
    dto: CreateGroupManualDto,
  ): Promise<ResponseDto<GroupResponseDto>> {
    const competition = await this.prisma.competition.findFirst({
      where: {
        id: competitionId,
        organization_id: userId,
        approval_status: 'ACCEPTED',
      },
    });
    if (!competition) throw new Error('Competition not found');

    if (competition.eliminationType !== EliminationType.GROUP_STAGE) {
      throw new BadRequestException(
        'Groups can only be created for group-stage competitions',
      );
    }
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

  async getCompetitionGroups(
    competitionId: bigint,
  ): Promise<ResponseDto<GroupResponseDto[]>> {
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
                standing: true,
              },
            },
          },
        },
      },
    });

    const mappedGroups = groups.map((g) => ({
      id: g.id,
      name: g.name,
      competitionId: g.competition_id,
      members: g.members.map((m) => {
        const s = m.participant.standing[0];
        return {
          id: m.participant.id.toString(),
          type: m.participant.team ? 'TEAM' : 'PLAYER',
          name:
            m.participant.team?.name ||
            m.participant.player?.user.full_name ||
            '',
          points: s?.points ?? 0,
          wins: s?.wins ?? 0,
          losses: s?.losses ?? 0,
        } as GroupParticipantDto;
      }),
    }));

    const response = mappedGroups.map((g) =>
      plainToInstance(GroupResponseDto, g, { excludeExtraneousValues: true }),
    );

    return {
      success: true,
      message: 'Groups retrieved successfully',
      data: response,
    };
  }

  async generateGroups(
    competitionId: bigint,
    userId: bigint,
    dto: GenerateGroupsDto,
  ): Promise<ResponseDto<GroupResponsePlainDto[]>> {
    const existingGroups = await this.prisma.competitionGroup.findMany({
      where: { competition_id: competitionId },
    });
    if (existingGroups.length > 0) {
      throw new BadRequestException(
        'Groups already exist for this competition',
      );
    }

    const competition = await this.prisma.competition.findFirst({
      where: {
        id: competitionId,
        organization_id: userId,
        approval_status: 'ACCEPTED',
      },
      include: { participants: true },
    });
    if (!competition) throw new BadRequestException('Competition not found');
    if (competition.eliminationType !== 'GROUP_STAGE') {
      throw new BadRequestException(
        'Groups can only be generated for group-stage competitions',
      );
    }

    const participants = competition.participants.filter(
      (p) => p.status === 'ACCEPTED',
    );

    const totalSpots = dto.numberOfGroups * dto.participantsPerGroup;
    if (participants.length < totalSpots) {
      throw new BadRequestException(
        `Not enough participants: ${participants.length} for ${totalSpots} spots`,
      );
    }
    if (participants.length > totalSpots) {
      throw new BadRequestException(
        `Too many participants: ${participants.length} for ${totalSpots} spots`,
      );
    }

    const shuffled = [...participants].sort(() => Math.random() - 0.5);

    let index = 0;
    for (let i = 1; i <= dto.numberOfGroups; i++) {
      const group = await this.prisma.competitionGroup.create({
        data: {
          name: `Group ${String.fromCharCode(64 + i)}`,
          competition_id: competitionId,
        },
      });

      const groupMembers: { id: bigint }[] = [];
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
        groupMembers.push({ id: participant.id });
      }

      for (let x = 0; x < groupMembers.length; x++) {
        for (let y = x + 1; y < groupMembers.length; y++) {
          await this.prisma.match.create({
            data: {
              competition_id: competitionId,
              group_id: group.id,
              participant1_id: groupMembers[x].id,
              participant2_id: groupMembers[y].id,
              stage: 'GROUP_STAGE',
              status: 'SCHEDULED',
            },
          });
        }
      }
    }

    const groups = await this.prisma.competitionGroup.findMany({
      where: { competition_id: competitionId },
      include: {
        members: {
          include: {
            participant: {
              include: { team: true, player: { include: { user: true } } },
            },
          },
        },
        matches: true,
        standing: true,
      },
    });

    const normalized = groups.map((g) => {
      const memberMap = new Map<bigint, any>();
      g.members.forEach((m) => {
        if (m.participant_id) memberMap.set(m.participant_id, m.participant);
      });

      return {
        id: g.id,
        name: g.name,
        competitionId: g.competition_id,
        members: g.members.map((m) => ({
          ...m.participant,
          points: m.points,
          wins: m.wins,
          losses: m.losses,
        })),
        matches: g.matches.map((m) => ({
          id: m.id,
          participant1: m.participant1_id
            ? memberMap.get(m.participant1_id)
            : null,
          participant2: m.participant2_id
            ? memberMap.get(m.participant2_id)
            : null,
          status: m.status,
          stage: m.stage,
          score_participant1: m.score_participant1 ?? 0,
          score_participant2: m.score_participant2 ?? 0,
          scheduled_at: m.scheduled_at ?? null,
        })),
      };
    });

    const response = plainToInstance(GroupResponsePlainDto, normalized, {
      excludeExtraneousValues: true,
    });

    return {
      success: true,
      message: 'Groups and matches generated successfully',
      data: response,
    };
  }
}
