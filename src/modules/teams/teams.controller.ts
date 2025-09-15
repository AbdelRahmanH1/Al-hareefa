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
import { UpdateTeamRequest } from './dto/request/UpdateTeam.dto';
import { ParseBigIntPipe } from 'src/shared/pipes/parse-bigint.pipe';
import { UserPayload } from 'src/shared/interfaces/user-payload.interface';
import { UserRole } from '@prisma/client';
import { TeamResponseDto } from './dto/response/Team-response.dto';
import { ResponseDto } from 'src/shared/dto/response.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TeamResponseWrapperDto } from './memberships/dto/response/teamResponseWrapper';
import { PaginatedTeamsResponseDto } from './dto/response/PaginatedTeamsResponse.dto';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { AuthorizationGuard } from 'src/shared/guards/authorization.gurad';

@ApiTags('teams')
@ApiBearerAuth('bearerAuth')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamService: TeamsService) {}

  @Post('/')
  @UseGuards(
    AuthenticationGuard,
    AuthorizationGuard(UserRole.PLAYER, UserRole.COACH),
  )
  @ApiOperation({ summary: 'Create a new team' })
  @ApiBody({
    type: CreateTeamRequest,
    description: 'Data to create a new team',
  })
  @ApiResponse({
    status: 201,
    description: 'Team created successfully',
    type: TeamResponseWrapperDto,
  })
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
  @ApiOperation({ summary: 'update a team' })
  @ApiBody({
    type: UpdateTeamRequest,
    description: 'Data to update a team',
  })
  @ApiResponse({
    status: 201,
    description: 'Team updated successfully',
    type: TeamResponseWrapperDto,
  })
  async updateTeam(
    @Req() req: { user: UserPayload },
    @Param('teamId', ParseBigIntPipe) teamId: bigint,
    @Body() data: UpdateTeamRequest,
  ): Promise<ResponseDto<TeamResponseDto>> {
    return this.teamService.updateTeam(teamId, req.user.userId, data);
  }

  @Delete('/:teamId')
  @UseGuards(
    AuthenticationGuard,
    AuthorizationGuard(UserRole.COACH, UserRole.PLAYER),
  )
  @ApiOperation({ summary: 'delate a team with id' })
  @ApiResponse({
    status: 201,
    description: 'Team delete successfully',
  })
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
  @ApiOperation({ summary: 'Get teams with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Teams fetched successfully',
    type: PaginatedTeamsResponseDto,
  })
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
  @ApiOperation({ summary: 'search for a team' })
  @ApiResponse({
    status: 200,
    description: 'Team updated successfully',
    type: TeamResponseWrapperDto,
  })
  async findTeamById(
    @Query('teamId', ParseBigIntPipe) teamId: bigint,
    @Query('name') name: string,
  ) {
    return this.teamService.searchTeam({ teamId, name });
  }
}
