import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { AuthorizationGuard } from 'src/shared/guards/authorization.gurad';
import { GroupsService } from './groups.service';
import { UserPayload } from 'src/shared/interfaces/user-payload.interface';
import { ParseBigIntPipe } from 'src/shared/pipes/parse-bigint.pipe';
import { CreateGroupManualDto } from './dto/request/CreateGroupManual.dto';
import { GenerateGroupsDto } from './dto/request/GenerateGroups.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/shared/dto/ApiResponse.dto';
import { GroupResponseDto } from './dto/response/GroupResponse.dto';

@ApiTags('Competition - group')
@ApiBearerAuth('bearerAuth')
@Controller('competitions/:competitionId/groups')
@UseGuards(AuthenticationGuard, AuthorizationGuard(UserRole.ORGANIZATION))
export class GroupsController {
  constructor(private readonly service: GroupsService) {}

  @ApiOperation({ summary: 'create group automatic' })
  @ApiResponseDto(GroupResponseDto, true)
  @Post('auto')
  async createGroupAuto(
    @Param('competitionId', ParseBigIntPipe) competitionId: bigint,
    @Req() req: { user: UserPayload },
    @Body() dto: GenerateGroupsDto,
  ) {
    return this.service.generateGroups(competitionId, req.user.userId, dto);
  }

  @ApiOperation({ summary: 'create group manually' })
  @ApiResponseDto(GroupResponseDto)
  @Post('manual')
  async createGroupManual(
    @Req() req: { user: UserPayload },
    @Param('competitionId', ParseBigIntPipe) competitionId: bigint,
    @Body() request: CreateGroupManualDto,
  ) {
    return this.service.createGroupManual(
      req.user.userId,
      competitionId,
      request,
    );
  }

  @ApiOperation({ summary: 'get groups by competition' })
  @ApiResponseDto(GroupResponseDto, true)
  @Get()
  async getGroups(
    @Param('competitionId', ParseBigIntPipe) competitionId: bigint,
  ) {
    return this.service.getCompetitionGroups(competitionId);
  }
}
