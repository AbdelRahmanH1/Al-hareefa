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
import { UserRole } from '@prisma/client';
import { JoinTeamDto } from './dto/request/JoinTeam.dto';

@Controller('teams/memberships')
@UseGuards(AuthenticationGuard)
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Post(':teamId/invite/:playerId')
  @UseGuards(AuthorizationGuard(UserRole.PLAYER, UserRole.COACH))
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
  async generateInviteToken(
    @Req() req: { user: UserPayload },
    @Param('teamId', ParseBigIntPipe) teamId: bigint,
  ) {
    return this.membershipsService.generateInviteToken(teamId, req.user.userId);
  }

  @Post('join')
  @UseGuards(AuthorizationGuard(UserRole.PLAYER))
  async joinTeamByToken(
    @Req() req: { user: UserPayload },
    @Body() data: JoinTeamDto,
  ) {
    return this.membershipsService.joinTeamByToken(req.user.userId, data.token);
  }
}
