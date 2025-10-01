import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserPayload } from 'src/shared/interfaces/user-payload.interface';
import { CreateCompetitionType } from './dto/CreateCompetition-type.dto';
import { CompetitionTypeService } from './admin-competition-type.service';
import { ParseBigIntPipe } from 'src/shared/pipes/parse-bigint.pipe';
import { UpdateCompetitionType } from './dto/UpdateCompetiton-type.dto';
import { UserRole } from '@prisma/client';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { AuthorizationGuard } from 'src/shared/guards/authorization.gurad';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CompetitionTypeResponseDto } from './dto/competition-type-response.dto';
import { ApiResponseDto } from 'src/shared/dto/ApiResponse.dto';

@ApiTags('Admin - Competition Types')
@ApiBearerAuth('bearerAuth')
@Controller('admin/competition-type')
@UseGuards(AuthenticationGuard, AuthorizationGuard(UserRole.ADMIN))
export class CompetitionTypeController {
  constructor(private readonly service: CompetitionTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Create new type of competition' })
  @ApiResponseDto(CompetitionTypeResponseDto)
  async createCompetitonType(
    @Req() req: { user: UserPayload },
    @Body() data: CreateCompetitionType,
  ) {
    return this.service.createGame(req.user.userId, data);
  }

  @Delete(':gameId')
  @ApiOperation({ summary: 'delete type of competition by id' })
  @ApiResponse({
    example: { success: true, message: 'Game delete successfully', data: null },
  })
  async deleteCompetitionType(
    @Param('gameId', ParseBigIntPipe) gameId: bigint,
  ) {
    return this.service.deleteGame(gameId);
  }

  @Patch(':gameId')
  @ApiOperation({ summary: 'update competition type by id' })
  @ApiResponseDto(CompetitionTypeResponseDto)
  async updateCompetitionType(
    @Param('gameId', ParseBigIntPipe) gameId: bigint,
    @Body() data: UpdateCompetitionType,
  ) {
    return this.service.updateGame(gameId, data);
  }

  @ApiOperation({ summary: 'get competition type' })
  @ApiResponse({
    example: {
      success: true,
      messsage: 'get types status',
      data: ['FOOTBALL', 'BASKETBALL'],
    },
  })
  @Get('option')
  async getOptions() {
    return this.service.competition_option();
  }
}
