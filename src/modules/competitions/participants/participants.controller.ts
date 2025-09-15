import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { UserPayload } from 'src/shared/interfaces/user-payload.interface';
import { ParseBigIntPipe } from 'src/shared/pipes/parse-bigint.pipe';
import { UserRole } from '@prisma/client';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { AuthorizationGuard } from 'src/shared/guards/authorization.gurad';

@Controller('competitions/:id/participants')
@UseGuards(AuthenticationGuard)
export class ParticipantsController {
  constructor(private readonly service: ParticipantsService) {}

  @Post('register-player')
  @UseGuards(AuthorizationGuard(UserRole.PLAYER))
  async joinPlayerCompetition(
    @Req() req: { user: UserPayload },
    @Param('id', ParseBigIntPipe) competitionId: bigint,
  ) {
    return this.service.registerPlayer(req.user.userId, competitionId);
  }
}
