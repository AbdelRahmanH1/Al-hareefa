import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompetitionService } from './admin-competition.service';
import { AuthenticationGuard } from 'src/auth/guards/authentication.guard';
import { AuthorizationGuard } from 'src/auth/guards/authorization.gurad';
import { ApprovalStatus, UserRole } from '@prisma/client';
import { ParseBigIntPipe } from 'src/shared/pipes/parse-bigint.pipe';
import { UpdateCompetitionStatusDto } from './dto/request/UpdateCompeitionStatus.dto';

@Controller('admin/competition')
export class CompetitionController {
  constructor(private readonly service: CompetitionService) {}

  @Get()
  @UseGuards(AuthenticationGuard, AuthorizationGuard(UserRole.ADMIN))
  async getCompetition(
    @Query('status') status: ApprovalStatus = ApprovalStatus.PENDING,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
  ) {
    return this.service.getCompetitionsByStatus(status, page, limit);
  }

  @Patch(':id/status')
  @UseGuards(AuthenticationGuard, AuthorizationGuard(UserRole.ADMIN))
  async updateCompetitionStatus(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() data: UpdateCompetitionStatusDto,
  ) {
    return this.service.updateCompetitionStatus(id, data);
  }
}
