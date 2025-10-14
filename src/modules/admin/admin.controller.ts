import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminRequest } from './dto/CreateAdminRequest.dto';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { AuthorizationGuard } from 'src/shared/guards/authorization.gurad';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Post('create-new-admin')
  @UseGuards(AuthenticationGuard, AuthorizationGuard(UserRole.ADMIN))
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Create admin (ADMIN only)' })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
    schema: {
      example: {
        success: true,
        message: 'Account created successfully',
      },
    },
  })
  async createNewAdmin(@Body() data: CreateAdminRequest) {
    return this.service.createAdmin(data);
  }

  /* @Post('test')
  async createMainAdmin() {
    return this.service.test();
  } */
}
