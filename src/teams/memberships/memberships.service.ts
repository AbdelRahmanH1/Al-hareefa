import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { getCompetitionStatus } from 'src/shared/helpers/competition-status.util';

@Injectable()
export class MembershipsService {
  constructor(private readonly prisma: PrismaService) {}

  async invitePlayer(teamId: bigint, inviterId: bigint, playerId: bigint) {
    const requested = await this.prisma.team.findFirst({
      where: {
        id: teamId,
        created_by_id: inviterId,
        is_deleted: false,
      },
    });

    if (!requested) {
      throw new ForbiddenException('Only team owner/admin can send invites');
    }

    if (playerId === inviterId) {
      throw new BadRequestException('You cannot invite yourself');
    }

    const player = await this.prisma.playerProfile.findUnique({
      where: { id: playerId },
      include: { user: true },
    });
    if (!player || !player?.user.is_active) {
      throw new BadRequestException('Player not found');
    }

    const existingMember = await this.prisma.teamMember.findUnique({
      where: { teamId_playerId: { teamId, playerId } },
    });
    if (existingMember) {
      if (existingMember.status == 'PENDING') {
        throw new BadRequestException('Invitation already sent and pending');
      }
      if (existingMember.status == 'ACCEPTED') {
        throw new BadRequestException('Player is already in the team');
      }
    }

    const invite = await this.prisma.teamMember.create({
      data: {
        teamId,
        playerId,
        roleInTeam: 'PLAYER',
        status: 'PENDING',
      },
      include: {
        player: {
          select: {
            id: true,
            user: { select: { full_name: true } },
          },
        },
      },
    });

    return {
      message: 'Invitation sent successfully',
      data: {
        invite: {
          teamId: invite.teamId,
          playerId: invite.playerId,
          playerName: invite.player.user.full_name,
          status: invite.status,
          inviteAt: invite.invitedAt,
        },
      },
    };
  }

  async respondToInvite(teamId: bigint, playerId: bigint, accepted: boolean) {
    const membership = await this.prisma.teamMember.findUnique({
      where: { teamId_playerId: { teamId, playerId } },
    });

    if (!membership || membership.status !== 'PENDING') {
      throw new NotFoundException('No pending invite found');
    }

    if (accepted) {
      const updated = await this.prisma.teamMember.update({
        where: { teamId_playerId: { teamId, playerId } },
        data: { status: 'ACCEPTED', respondedAt: new Date() },
      });

      return {
        message: 'Invitation accepted',
        data: {
          teamId: updated.teamId,
          playerId: updated.playerId,
          status: updated.status,
          respondedAt: updated.respondedAt,
        },
      };
    } else {
      await this.prisma.teamMember.delete({
        where: { teamId_playerId: { teamId, playerId } },
      });

      return {
        message: 'Invitation declined and removed',
        data: {
          teamId,
          playerId,
          status: 'DECLINED',
          respondedAt: new Date(),
        },
      };
    }
  }

  async removeMember(teamId: bigint, ownerId: bigint, memberId: bigint) {
    const team = await this.prisma.team.findFirst({
      where: { id: teamId, is_deleted: false },
    });

    if (!team) {
      throw new BadRequestException('Team not found');
    }

    if (team.created_by_id !== ownerId) {
      throw new ForbiddenException('Only team owner can remove members');
    }

    const membership = await this.prisma.teamMember.findFirst({
      where: { teamId, playerId: memberId, status: 'ACCEPTED' },
    });

    if (!membership) {
      throw new BadRequestException('Player is not a member of this team');
    }

    const competition = await this.prisma.competition.findFirst({
      where: { participants: { some: { team_id: teamId } } },
    });

    if (competition) {
      const status = getCompetitionStatus(
        competition.start_date,
        competition.end_date,
      );
      if (status === 'ONGOING') {
        throw new BadRequestException(
          'Cannot remove the member while competiton is ongoing',
        );
      }
    }

    await this.prisma.teamMember.delete({
      where: { teamId_playerId: { teamId, playerId: memberId } },
    });

    return { message: 'member delete successfully', data: { memberId } };
  }
}
