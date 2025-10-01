import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CompetitionService } from './admin-competition.service';
import { ApprovalStatus, UserRole } from '@prisma/client';
import { ParseBigIntPipe } from 'src/shared/pipes/parse-bigint.pipe';
import { UpdateCompetitionStatusDto } from './dto/request/UpdateCompeitionStatus.dto';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { AuthorizationGuard } from 'src/shared/guards/authorization.gurad';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  PaginatedCompetitionResponseDto,
  SingleCompetitionResponseDto,
} from 'src/modules/auth/dto/response/PaginatedCompetitionResponse.dto';
import { CompetitionResponseAdminDto } from './dto/response/Competition-response.dto';
import { ApiResponseDto } from 'src/shared/dto/ApiResponse.dto';

@ApiTags('Admin - Competitions')
@ApiBearerAuth('bearerAuth')
@Controller('admin/competition')
export class CompetitionController {
  constructor(private readonly service: CompetitionService) {}

  @Get()
  @UseGuards(AuthenticationGuard, AuthorizationGuard(UserRole.ADMIN))
  @ApiOperation({ summary: 'List competitions by approval status' })
  @ApiResponseDto(CompetitionResponseAdminDto, true)
  async getCompetition(
    @Query('status') status: ApprovalStatus = ApprovalStatus.PENDING,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
  ) {
    return this.service.getCompetitionsByStatus(status, page, limit);
  }

  @Patch(':id/status')
  @UseGuards(AuthenticationGuard, AuthorizationGuard(UserRole.ADMIN))
  @ApiOperation({ summary: 'Update competition approval status' })
  @ApiResponse({
    status: 200,
    description: 'update status successfully',
    type: SingleCompetitionResponseDto,
  })
  async updateCompetitionStatus(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() data: UpdateCompetitionStatusDto,
  ) {
    return this.service.updateCompetitionStatus(id, data);
  }
}
