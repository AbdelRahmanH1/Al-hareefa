import {
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { UserPayload } from 'src/shared/interfaces/user-payload.interface';
import { ParseBigIntPipe } from 'src/shared/pipes/parse-bigint.pipe';
import { UserRole } from '@prisma/client';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { AuthorizationGuard } from 'src/shared/guards/authorization.gurad';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponseDto } from 'src/shared/dto/ApiResponse.dto';
import { ParticipantResponseDto } from './dto/Participant-response.dto';

@ApiTags('Competition - participants')
@ApiBearerAuth('bearerAuth')
@Controller('competitions/:id/participants')
@UseGuards(AuthenticationGuard)
export class ParticipantsController {
  constructor(private readonly service: ParticipantsService) {}

  @ApiOperation({ summary: 'register player to  competition' })
  @ApiResponseDto(ParticipantResponseDto)
  @Post('register-player')
  @UseGuards(AuthorizationGuard(UserRole.PLAYER))
  async joinPlayerCompetition(
    @Req() req: { user: UserPayload },
    @Param('id', ParseBigIntPipe) competitionId: bigint,
  ) {
    return this.service.registerPlayer(req.user.userId, competitionId);
  }

  @ApiOperation({ summary: 'register team to  competition' })
  @ApiResponseDto(ParticipantResponseDto)
  @Post('register-team/:teamId')
  @UseGuards(AuthorizationGuard(UserRole.COACH, UserRole.PLAYER))
  async joinTeamCompetition(
    @Req() req: { user: UserPayload },
    @Param('id', ParseBigIntPipe) competitionId: bigint,
    @Param('teamId', ParseBigIntPipe) teamId: bigint,
  ) {
    return this.service.registerTeam(req.user.userId, teamId, competitionId);
  }

  @ApiOperation({ summary: 'cancel registration from competition' })
  @ApiResponse({
    example: {
      success: true,
      message: 'Participation cancelled successfully',
      data: null,
    },
  })
  @Delete('/unregister')
  @UseGuards(AuthorizationGuard(UserRole.PLAYER, UserRole.COACH))
  async leaveCompetition(
    @Req() req: { user: UserPayload },
    @Param('id', ParseBigIntPipe) competitionId: bigint,
  ) {
    return this.service.cancelParticipation(competitionId, req.user.userId);
  }
}
