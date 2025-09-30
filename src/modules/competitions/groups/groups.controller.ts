import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { AuthorizationGuard } from 'src/shared/guards/authorization.gurad';
import { GroupsService } from './groups.service';
import { UserPayload } from 'src/shared/interfaces/user-payload.interface';
import { ParseBigIntPipe } from 'src/shared/pipes/parse-bigint.pipe';
import { CreateGroupManualDto } from './dto/request/CreateGroupManual.dto';
import { GenerateGroupsDto } from './dto/request/GenerateGroups.dto';

@Controller('competitions/:competitionId/groups')
@UseGuards(AuthenticationGuard, AuthorizationGuard(UserRole.ORGANIZATION))
export class GroupsController {
  constructor(private readonly service: GroupsService) {}

  @Post('auto')
  async createGroupAuto(
    @Param('competitionId', ParseBigIntPipe) competitionId: bigint,
    @Req() req: { user: UserPayload },
    dto: GenerateGroupsDto,
  ) {
    return this.service.generateGroups(competitionId, req.user.userId, dto);
  }

  @Post('manual')
  async createGroupManual(
    @Req() req: { user: UserPayload },
    @Param('competitionId', ParseBigIntPipe) competitionId: bigint,
    request: CreateGroupManualDto,
  ) {
    return this.service.createGroupManual(
      req.user.userId,
      competitionId,
      request,
    );
  }

  @Get()
  async getGroups(
    @Param('competitionId', ParseBigIntPipe) competitionId: bigint,
  ) {
    return this.service.getCompetitionGroups(competitionId);
  }
}
