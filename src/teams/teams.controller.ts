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
import { CreateTeamRequest } from './dto/CreateTeam.dto';
import { TeamsService } from './teams.service';
import { AuthenticationGuard } from 'src/auth/guards/authentication.guard';
import { AuthorizationGuard } from 'src/auth/guards/authorization.gurad';
import { UserRole } from 'generated/prisma';
import { UpdateTeamRequest } from './dto/UpdateTeam.dto';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamService: TeamsService) {}

  @Post('/')
  @UseGuards(
    AuthenticationGuard,
    AuthorizationGuard(UserRole.PLAYER, UserRole.COACH),
  )
  async createTeam(@Req() req: any, @Body() data: CreateTeamRequest) {
    return this.teamService.createTeam(data, req.user.userId, req.user.role);
  }

  @Put('/:teamId')
  @UseGuards(
    AuthenticationGuard,
    AuthorizationGuard(UserRole.COACH, UserRole.PLAYER),
  )
  async updateTeam(
    @Req() req: any,
    @Param('teamId') teamId: bigint,
    @Body() data: UpdateTeamRequest,
  ) {
    return this.teamService.updateTeam(teamId, req.user.userId, data);
  }

  @Delete('/:teamId')
  @UseGuards(
    AuthenticationGuard,
    AuthorizationGuard(UserRole.COACH, UserRole.PLAYER),
  )
  async deleteTeam(@Param('teamId') teamId: bigint, @Req() req: any) {
    return this.teamService.softDeleteTeam(teamId, req.user.userId);
  }

  @Get()
  @UseGuards(
    AuthenticationGuard,
    AuthorizationGuard(UserRole.COACH, UserRole.PLAYER),
  )
  async getTeams(
    @Req() req,
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
    @Query('teamId') teamId: bigint,
    @Query('name') name: string,
  ) {
    return this.teamService.searchTeam({ teamId, name });
  }
}
