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

@Controller('teams/:teamId/memberships')
@UseGuards(AuthenticationGuard)
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Post('invite/:playerId')
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

  @Post(':playerId/respond')
  @UseGuards(AuthorizationGuard(UserRole.PLAYER))
  async respondToInvite(
    @Req() req: { user: UserPayload },
    @Param('teamId', ParseBigIntPipe) teamId: bigint,
    @Param('playerId', ParseBigIntPipe) playerId: bigint,
    @Body('accepted', ParseBoolPipe) accepted: boolean,
  ) {
    return this.membershipsService.respondToInvite(teamId, playerId, accepted);
  }

  @Delete(':memberId')
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
}
