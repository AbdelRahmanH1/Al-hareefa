import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { UserPayload } from 'src/shared/interfaces/user-payload.interface';
import { ParseBigIntPipe } from 'src/shared/pipes/parse-bigint.pipe';
import { CreateMatchRequestDto } from './dto/request/createMatchRequest.dto';
import { UpadateMatchRequestDto } from './dto/request/updateMatchRequest.dto';
import { SetMatchResultDto } from '../dto/request/SetMatchRequest.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/shared/dto/ApiResponse.dto';
import { AllMatchResponseDto } from './dto/response/allMatchsResponse.dto';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { AuthorizationGuard } from 'src/shared/guards/authorization.gurad';
import { UserRole } from '@prisma/client';

@ApiTags('Competition - match')
@ApiBearerAuth('bearerAuth')
@Controller('competitions')
@UseGuards(AuthenticationGuard)
export class MatchesController {
  constructor(private readonly matcheService: MatchesService) {}

  @ApiOperation({ summary: 'set match result' })
  @ApiResponseDto(AllMatchResponseDto)
  @Post('match/:matchId/set-result')
  async setMatchResult(
    @Req() req: { user: UserPayload },
    @Param('matchId', ParseBigIntPipe) matchId: bigint,
    @Body() data: SetMatchResultDto,
  ) {
    return this.matcheService.setMatchResult(req.user.userId, matchId, data);
  }

  @ApiOperation({ summary: 'create match manually' })
  @ApiResponseDto(AllMatchResponseDto)
  @Post(':competitionId/match/create/manual')
  @UseGuards(AuthorizationGuard(UserRole.ORGANIZATION))
  async createMatchManually(
    @Req() req: { user: UserPayload },
    @Param('competitionId', ParseBigIntPipe) competitionId: bigint,
    @Body() data: CreateMatchRequestDto,
  ) {
    return this.matcheService.createMatchManually(
      req.user.userId,
      competitionId,
      data,
    );
  }

  @ApiOperation({ summary: 'get matches by competition id' })
  @ApiResponseDto(AllMatchResponseDto)
  @Get(':competitionId/match')
  async getMacthesById(
    @Param('competitionId', ParseBigIntPipe) competitionId: bigint,
  ) {
    return this.matcheService.getMatchesByCompetitionId(competitionId);
  }

  @ApiOperation({ summary: 'create knockout matches first time' })
  @ApiResponseDto(AllMatchResponseDto, true)
  @Post(':competitionId/match/generate-knockout-first')
  async generateKnockoutFirstRound(
    @Param('competitionId', ParseBigIntPipe) competitionId: bigint,
    @Req() req: { user: UserPayload },
  ) {
    return this.matcheService.generateKnockoutFirstRound(
      competitionId,
      req.user.userId,
    );
  }

  @ApiOperation({ summary: 'create knockout matches after first time' })
  @ApiResponseDto(AllMatchResponseDto, true)
  @Post(':competitionId/match/generate-knockout-next')
  async generateNextKnockoutRound(
    @Param('competitionId', ParseBigIntPipe) competitionId: bigint,
    @Req() req: { user: UserPayload },
  ) {
    return this.matcheService.generateNextKnockoutRound(
      competitionId,
      req.user.userId,
    );
  }

  @ApiOperation({ summary: 'update match' })
  @ApiResponseDto(AllMatchResponseDto)
  @Patch('match/:matchId')
  async updateMatch(
    @Param('matchId', ParseBigIntPipe) matchId: bigint,
    @Req() req: { user: UserPayload },
    @Body() data: UpadateMatchRequestDto,
  ) {
    return this.matcheService.updateMatch(matchId, req.user.userId, data);
  }
}
