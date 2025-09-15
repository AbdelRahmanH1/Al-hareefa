import {
  Body,
  Controller,
  Delete,
  Param,
  ParseBoolPipe,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { AuthenticationGuard } from 'src/auth/guards/authentication.guard';
import { ParseBigIntPipe } from 'src/shared/pipes/parse-bigint.pipe';
import { UserPayload } from 'src/shared/interfaces/user-payload.interface';
import { AuthorizationGuard } from 'src/auth/guards/authorization.gurad';
import { GameType, UserRole } from '@prisma/client';
import { JoinTeamDto } from './dto/request/JoinTeam.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TeamInviteResponseDto } from './dto/response/TeamInvite-response.dto';
import { TeamMemberWrapper } from './dto/response/TeamReponseWrapper.dto';
import { TeamInviteQRResponseDto } from './dto/response/TeamInviteQr-response.dto';
import { ResponseDto } from 'src/shared/dto/response.dto';

@Controller('teams/memberships')
@UseGuards(AuthenticationGuard)
@ApiTags('team-memberships')
@ApiBearerAuth('bearerAuth')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Post(':teamId/invite/:playerId')
  @UseGuards(AuthorizationGuard(UserRole.PLAYER, UserRole.COACH))
  @ApiOperation({ summary: 'Invite a player to a team' })
  @ApiParam({ name: 'teamId', description: 'Team ID', type: String })
  @ApiParam({ name: 'playerId', description: 'Player ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Player invited successfully',
    type: TeamMemberWrapper,
  })
  async invitePlayer(
    @Req() req: { user: UserPayload },
    @Param('teamId', ParseBigIntPipe) teamId: bigint,
    @Param('playerId', ParseBigIntPipe) playerId: bigint,
  ) {
    return this.membershipsService.invitePlayer(
      teamId,
      req.user.userId,
      playerId,
    );
  }

  @Post(':teamId/:playerId/respond')
  @UseGuards(AuthorizationGuard(UserRole.PLAYER))
  @ApiOperation({ summary: 'Respond to a team invitation' })
  @ApiParam({ name: 'teamId', description: 'Team ID', type: String })
  @ApiParam({ name: 'playerId', description: 'Player ID', type: String })
  @ApiBody({
    description: 'Acceptance of invitation',
    schema: { type: 'object', properties: { accepted: { type: 'boolean' } } },
  })
  @ApiResponse({
    status: 200,
    description: 'Invitation response saved successfully',
  })
  async respondToInvite(
    @Req() req: { user: UserPayload },
    @Param('teamId', ParseBigIntPipe) teamId: bigint,
    @Param('playerId', ParseBigIntPipe) playerId: bigint,
    @Body('accepted', ParseBoolPipe) accepted: boolean,
  ) {
    return this.membershipsService.respondToInvite(teamId, playerId, accepted);
  }

  @Delete(':teamId/:memberId')
  @UseGuards(AuthorizationGuard(UserRole.COACH, UserRole.PLAYER))
  @ApiOperation({ summary: 'Remove a member from a team' })
  @ApiParam({ name: 'teamId', description: 'Team ID', type: String })
  @ApiParam({ name: 'memberId', description: 'Member ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Member removed successfully',
    example: {
      succes: true,
      message: 'Member removed successfully',
      data: null,
    },
  })
  async removeMember(
    @Req() req: { user: UserPayload },
    @Param('teamId', ParseBigIntPipe) teamId: bigint,
    @Param('memberId', ParseBigIntPipe) memberId: bigint,
  ) {
    return this.membershipsService.removeMember(
      teamId,
      req.user.userId,
      memberId,
    );
  }

  @Post(':teamId/generate')
  @UseGuards(AuthorizationGuard(UserRole.COACH, UserRole.PLAYER))
  @ApiOperation({ summary: 'Generate an invite token for a team' })
  @ApiParam({ name: 'teamId', description: 'Team ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Invite token generated successfully',
    example: {
      success: true,
      message: 'generated code successfully',
      data: {
        token: 'token',
        teamId: 'teamId',
        teamName: 'teamName',
        gameType: GameType.FOOTBALL,
      },
    },
  })
  async generateInviteToken(
    @Req() req: { user: UserPayload },
    @Param('teamId', ParseBigIntPipe) teamId: bigint,
  ) {
    return this.membershipsService.generateInviteToken(teamId, req.user.userId);
  }

  @Post('join')
  @UseGuards(AuthorizationGuard(UserRole.PLAYER))
  @ApiOperation({ summary: 'Join a team using an invite token' })
  @ApiBody({ type: JoinTeamDto, description: 'Invite token data' })
  @ApiResponse({
    status: 200,
    description: 'Joined team successfully',
    example: {
      success: true,
      message: 'Joined team successfully',
      data: null,
    },
  })
  async joinTeamByToken(
    @Req() req: { user: UserPayload },
    @Body() data: JoinTeamDto,
  ) {
    return this.membershipsService.joinTeamByToken(req.user.userId, data.token);
  }
}
