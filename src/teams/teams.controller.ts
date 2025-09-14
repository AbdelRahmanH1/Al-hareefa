import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateTeamRequest } from './dto/request/CreateTeam.dto';
import { TeamsService } from './teams.service';
import { AuthenticationGuard } from 'src/auth/guards/authentication.guard';
import { AuthorizationGuard } from 'src/auth/guards/authorization.gurad';
import { UpdateTeamRequest } from './dto/request/UpdateTeam.dto';
import { ParseBigIntPipe } from 'src/shared/pipes/parse-bigint.pipe';
import { UserPayload } from 'src/shared/interfaces/user-payload.interface';
import { UserRole } from '@prisma/client';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamService: TeamsService) {}

  @Post('/')
  @UseGuards(
    AuthenticationGuard,
    AuthorizationGuard(UserRole.PLAYER, UserRole.COACH),
  )
  async createTeam(
    @Req() req: { user: UserPayload },
    @Body() data: CreateTeamRequest,
  ) {
    return this.teamService.createTeam(data, req.user.userId, req.user.role);
  }

  @Put('/:teamId')
  @UseGuards(
    AuthenticationGuard,
    AuthorizationGuard(UserRole.COACH, UserRole.PLAYER),
  )
  async updateTeam(
    @Req() req: { user: UserPayload },
    @Param('teamId', ParseBigIntPipe) teamId: bigint,
    @Body() data: UpdateTeamRequest,
  ) {
    return this.teamService.updateTeam(teamId, req.user.userId, data);
  }

  @Delete('/:teamId')
  @UseGuards(
    AuthenticationGuard,
    AuthorizationGuard(UserRole.COACH, UserRole.PLAYER),
  )
  async deleteTeam(
    @Param('teamId', ParseBigIntPipe) teamId: bigint,
    @Req() req: { user: UserPayload },
  ) {
    return this.teamService.softDeleteTeam(teamId, req.user.userId);
  }

  @Get()
  @UseGuards(
    AuthenticationGuard,
    AuthorizationGuard(UserRole.COACH, UserRole.PLAYER),
  )
  async getTeams(
    @Req() req: { user: UserPayload },
    @Query('owned') owned?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const onlyOwned = owned === 'true';
    return this.teamService.getTeams(req.user.userId, page, limit, onlyOwned);
  }

  @Get('/search')
  @UseGuards(AuthenticationGuard)
  async findTeamById(
    @Query('teamId', ParseBigIntPipe) teamId: bigint,
    @Query('name') name: string,
  ) {
    return this.teamService.searchTeam({ teamId, name });
  }
}
