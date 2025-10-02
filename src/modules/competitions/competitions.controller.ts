import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { UserPayload } from 'src/shared/interfaces/user-payload.interface';
import { CreateCompetitionRequestDto } from './dto/request/CreateCompetition-request.dto';
import { EliminationType, UserRole } from '@prisma/client';
import { ParseBigIntPipe } from 'src/shared/pipes/parse-bigint.pipe';
import { GetCompetitionsFilterDto } from './dto/request/GetCompetitionsFilter.dto';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { AuthorizationGuard } from 'src/shared/guards/authorization.gurad';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponseDto } from 'src/shared/dto/ApiResponse.dto';
import { CompetitionResponseDto } from './dto/response/Competition-response.dto';

@ApiTags('Competition')
@ApiBearerAuth('bearerAuth')
@Controller('competitions')
@UseGuards(AuthenticationGuard)
export class CompetitionsController {
  constructor(private readonly service: CompetitionsService) {}

  @ApiOperation({ summary: 'create competition' })
  @ApiResponseDto(CompetitionResponseDto)
  @Post()
  @UseGuards(AuthorizationGuard(UserRole.ORGANIZATION))
  async create(
    @Req() req: { user: UserPayload },
    @Body() data: CreateCompetitionRequestDto,
  ) {
    return this.service.createCompetition(req.user.userId, data);
  }

  /*  @Patch(':id')
    @UseGuards(AuthorizationGuard(UserRole.ORGANIZATION))
  async update(
    @Param('id', ParseBigIntPipe) eventId: bigint,
    @Req() req: { user: UserPayload },
    data: UpdateCompetitionRequestDto,
  ) {
    return this.service.updateCompetition(eventId, req.user.userId, data);
  } */

  @ApiOperation({ summary: 'delete competition by id' })
  @ApiResponse({
    example: {
      success: true,
      message: 'Comepittion deleted successfully',
      data: null,
    },
  })
  @Delete(':id')
  @UseGuards(AuthorizationGuard(UserRole.ORGANIZATION))
  async delete(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Req() req: { user: UserPayload },
  ) {
    return this.service.deleteCompetition(id, req.user.userId);
  }

  @ApiOperation({ summary: 'get competition by filter' })
  @ApiResponseDto(CompetitionResponseDto, true)
  @Get()
  async getAll(@Query() filters: GetCompetitionsFilterDto) {
    const { page, limit, ...filterData } = filters;
    return this.service.getAllCompetitions(page, limit, filterData);
  }

  @ApiOperation({ summary: 'get competition options' })
  @ApiResponse({
    example: {
      success: true,
      message: 'Competition form options retrieved successfully',
      data: {
        feeTypes: ['SINGLE', 'TEAM_SINGLE_FEE'],
        eliminationType: ['SINGLE ELIMINATION', 'KNOCKOUT'],
        competitionTypes: [{ name: 'string', id: 1 }],
      },
    },
  })
  @Get('option')
  @UseGuards(AuthorizationGuard(UserRole.ORGANIZATION))
  async getCompetitionOption() {
    return this.service.getCompetitionOptions();
  }

  @ApiOperation({ summary: 'get competition by id' })
  @ApiResponseDto(CompetitionResponseDto)
  @Get(':id')
  @UseGuards(AuthorizationGuard(UserRole.ORGANIZATION))
  async getCompetitionById(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.service.getCompetitionById(id);
  }
}
