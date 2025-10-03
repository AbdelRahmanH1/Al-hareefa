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
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { UserPayload } from 'src/shared/interfaces/user-payload.interface';
import { ClassServiceRequestDto } from './dto/request/CreateServiceRequest.dto';
import { ServicesService } from './services.service';
import { UpdateServiceRequestDto } from './dto/request/UpdateServiceRequest.dto';
import { SearchServiceRequestDto } from './dto/request/SearchServiceRequestDto';
import { AuthorizationGuard } from 'src/shared/guards/authorization.gurad';
import { UserRole } from '@prisma/client';
import { ParseBigIntPipe } from 'src/shared/pipes/parse-bigint.pipe';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponseDto } from 'src/shared/dto/ApiResponse.dto';
import { ServiceResponseDto } from './dto/response/ServiceResponse.dto';
import { PaginatedResponseDto } from 'src/shared/dto/PaginatedResponse.dto';
import { ResponseDto } from 'src/shared/dto/response.dto';

@ApiTags('Coach services')
@ApiBearerAuth('bearerAuth')
@Controller('services')
@UseGuards(AuthenticationGuard)
export class ServicesController {
  constructor(private readonly service: ServicesService) {}

  @ApiOperation({ summary: 'create service' })
  @ApiResponse({
    example: { success: true, message: 'Service created successfully' },
  })
  @Post()
  @UseGuards(AuthorizationGuard(UserRole.COACH))
  async createService(
    @Req() req: { user: UserPayload },
    @Body() data: ClassServiceRequestDto,
  ) {
    return this.service.createService(req.user.userId, data);
  }

  @ApiOperation({ summary: 'update service by Id' })
  @ApiResponse({
    example: { success: true, message: 'Service updated successfully' },
  })
  @Put(':serviceId')
  @UseGuards(AuthorizationGuard(UserRole.COACH))
  async updateService(
    @Req() req: { user: UserPayload },
    @Param('serviceId', ParseBigIntPipe) serviceId: bigint,
    @Body() data: UpdateServiceRequestDto,
  ) {
    return this.service.updateService(req.user.userId, serviceId, data);
  }

  @ApiOperation({ summary: 'delete service by Id' })
  @ApiResponse({
    example: { success: true, message: 'Service deleted successfully' },
  })
  @Delete(':serviceId')
  @UseGuards(AuthorizationGuard(UserRole.COACH))
  async deleteService(
    @Req() req: { user: UserPayload },
    @Param('serviceId', ParseBigIntPipe) serviceId: bigint,
  ) {
    return this.service.deleteService(req.user.userId, serviceId);
  }

  @ApiOperation({ summary: 'get service by captian' })
  @Get('my')
  @UseGuards(AuthorizationGuard(UserRole.COACH))
  async getMyServices(@Req() req: { user: UserPayload }) {
    return this.service.getMyServices(req.user.userId);
  }

  @ApiOperation({ summary: 'search for services by filter' })
  @Get('search')
  async searchServices(@Query() query: SearchServiceRequestDto) {
    return this.service.searchServices(query);
  }
}
