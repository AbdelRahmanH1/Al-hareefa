import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApprovalStatus, UserRole } from '@prisma/client';

import { OrganizationService } from './admin-organization.service';
import { ParseBigIntPipe } from 'src/shared/pipes/parse-bigint.pipe';
import { UpdateOrganizationStatusDto } from './dto/UpdateOrganizationStatus.dto';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { AuthorizationGuard } from 'src/shared/guards/authorization.gurad';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginatedOrganizationsResponseDto } from './dto/PaginatedOrganizations-esponse.dto';
import { ApiResponseDto } from 'src/shared/dto/ApiResponse.dto';
import { OrganizationResponseDto } from './dto/OrganizationResponsedto';

@ApiTags('Admin - organization ')
@ApiBearerAuth('bearerAuth')
@Controller('admin/organization')
export class OrganizationController {
  constructor(private readonly service: OrganizationService) {}

  @ApiOperation({ summary: 'get organization by status' })
  @ApiResponseDto(PaginatedOrganizationsResponseDto)
  @Get()
  @UseGuards(AuthenticationGuard, AuthorizationGuard(UserRole.ADMIN))
  async getOrganizations(
    @Query('status') status: ApprovalStatus = ApprovalStatus.PENDING,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
  ) {
    return this.service.getOrganizationsByStatus(status, page, limit);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'update organization status' })
  @ApiResponseDto(OrganizationResponseDto)
  @UseGuards(AuthenticationGuard, AuthorizationGuard(UserRole.ADMIN))
  async updateOrganizationStatus(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() data: UpdateOrganizationStatusDto,
  ) {
    return this.service.updateOrganizationStatus(id, data);
  }
}
