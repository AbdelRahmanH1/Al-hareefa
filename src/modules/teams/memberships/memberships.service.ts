import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApprovalStatus, TeamMemberRole } from '@prisma/client';
import { jwtConfig } from 'src/config/JwtConfig';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { TeamInviteResponseDto } from './dto/response/TeamInvite-response.dto';
import { plainToInstance } from 'class-transformer';
import { TeamInviteQRResponseDto } from './dto/response/TeamInviteQr-response.dto';

@Injectable()
export class MembershipsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /** Invite a player to the team */

  async invitePlayer(
    teamId: bigint,
    inviterId: bigint,
    playerId: bigint,
  ): Promise<ResponseDto<TeamInviteResponseDto>> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId, is_deleted: false },
    });
    if (!team) throw new NotFoundException('Team not found');
    if (team.created_by_id !== inviterId) {
      throw new ForbiddenException('Only the team owner can send invites');
    }
    if (playerId === inviterId) {
      throw new BadRequestException('You cannot invite yourself');
    }

    const player = await this.prisma.playerProfile.findUnique({
      where: { id: playerId },
      include: { user: true },
    });
    if (!player || !player.user.is_active) {
      throw new BadRequestException('Player not found or inactive');
    }

    const [existingMember, existingInvite] = await Promise.all([
      this.prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId: player.userId } },
      }),
      this.prisma.teamInvite.findFirst({
        where: { team_id: teamId, invited_id: playerId, status: 'PENDING' },
      }),
    ]);

    if (existingMember) {
      throw new BadRequestException('Player is already in the team');
    }
    if (existingInvite) {
      throw new BadRequestException('Invitation already sent and pending');
    }

    const invite = await this.prisma.teamInvite.create({
      data: {
        team_id: teamId,
        invited_id: playerId,
        invited_role: TeamMemberRole.PLAYER,
        invited_by_id: inviterId,
      },
    });

    return {
      success: true,
      message: 'Invitation sent',
      data: plainToInstance(TeamInviteResponseDto, invite, {
        excludeExtraneousValues: true,
      }),
    };
  }

  /** Respond to an invite (accept/reject) */

  async respondToInvite(
    teamId: bigint,
    playerId: bigint,
    accepted: boolean,
  ): Promise<ResponseDto<any>> {
    const invite = await this.prisma.teamInvite.findFirst({
      where: { team_id: teamId, invited_id: playerId, status: 'PENDING' },
    });
    if (!invite) throw new NotFoundException('No pending invite found');

    let updatedInvite;
    if (accepted) {
      await this.prisma.$transaction(async (tx) => {
        await tx.teamMember.create({
          data: {
            teamId,
            userId: playerId,
            roleInTeam: TeamMemberRole.PLAYER,
            respondedAt: new Date(),
          },
        });
        updatedInvite = await tx.teamInvite.update({
          where: { id: invite.id },
          data: { status: ApprovalStatus.ACCEPTED },
        });
      });
    } else {
      updatedInvite = await this.prisma.teamInvite.update({
        where: { id: invite.id },
        data: { status: ApprovalStatus.REJECTED },
      });
    }

    return {
      success: true,
      message: accepted ? 'Invitation accepted' : 'Invitation declined',
      data: updatedInvite,
    };
  }

  /** Remove a member from the team */
  async removeMember(
    teamId: bigint,
    ownerId: bigint,
    memberId: bigint,
  ): Promise<ResponseDto<{ memberId: bigint }>> {
    const team = await this.prisma.team.findFirst({
      where: { id: teamId, is_deleted: false },
    });
    if (!team) throw new NotFoundException('Team not found');
    if (team.created_by_id !== ownerId) {
      throw new ForbiddenException('Only team owner can remove members');
    }

    const membership = await this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: memberId } },
    });
    if (!membership) {
      throw new BadRequestException('Player is not a member of this team');
    }

    const activeCompetition = await this.prisma.competition.findFirst({
      where: {
        participants: { some: { team_id: teamId } },
        end_date: { gte: new Date() },
      },
    });
    if (activeCompetition) {
      throw new BadRequestException(
        `Cannot remove member while registered in active competition: ${activeCompetition.name}`,
      );
    }

    await this.prisma.teamMember.delete({
      where: { teamId_userId: { teamId, userId: memberId } },
    });

    return {
      success: true,
      message: 'Member removed successfully',
      data: { memberId },
    };
  }

  /** Generate an invite token for QR sharing */
  async generateInviteToken(
    teamId: bigint,
    inviterId: bigint,
  ): Promise<ResponseDto<TeamInviteQRResponseDto>> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId, is_deleted: false },
    });
    if (!team) throw new NotFoundException('Team not found');
    if (team.created_by_id !== inviterId) {
      throw new ForbiddenException('Only owner can generate invites');
    }

    const token = this.jwtService.sign(
      { teamId: teamId.toString() },
      { secret: jwtConfig.SECRET_KEY, expiresIn: '2h' },
    );

    return {
      success: true,
      message: 'Generated code successfully',
      data: {
        token,
        teamId: team.id,
        teamName: team.name,
        gameType: team.game,
      },
    };
  }

  /** Join team using token */
  async joinTeamByToken(
    userId: bigint,
    token: string,
  ): Promise<ResponseDto<null>> {
    let payload: any;
    try {
      payload = this.jwtService.verify(token, {
        secret: jwtConfig.SECRET_KEY,
      });
    } catch {
      throw new BadRequestException('Invalid or expired invite link');
    }

    const teamId = BigInt(payload.teamId);

    const existingMember = await this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: userId } },
    });
    if (existingMember) {
      throw new BadRequestException('You are already a member of this team');
    }

    await this.prisma.teamMember.create({
      data: {
        teamId,
        userId: userId,
        roleInTeam: TeamMemberRole.PLAYER,
        respondedAt: new Date(),
      },
    });

    return { success: true, message: 'Joined team successfully', data: null };
  }
}
