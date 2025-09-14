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
import { AuthenticationGuard } from 'src/auth/guards/authentication.guard';
import { AuthorizationGuard } from 'src/auth/guards/authorization.gurad';
import { OrganizationService } from './admin-organization.service';
import { ParseBigIntPipe } from 'src/shared/pipes/parse-bigint.pipe';
import { UpdateOrganizationStatusDto } from './dto/UpdateOrganizationStatus.dto';
import { UserPayload } from 'src/shared/interfaces/user-payload.interface';

@Controller('admin/organization')
export class OrganizationController {
  constructor(private readonly service: OrganizationService) {}

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
  @UseGuards(AuthenticationGuard, AuthorizationGuard(UserRole.ADMIN))
  async updateOrganizationStatus(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() data: UpdateOrganizationStatusDto,
  ) {
    return this.service.updateOrganizationStatus(id, data);
  }
}
