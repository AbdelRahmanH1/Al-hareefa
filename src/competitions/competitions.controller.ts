import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { UserPayload } from 'src/shared/interfaces/user-payload.interface';
import { CreateCompetitionRequestDto } from './dto/request/CreateCompetition-request.dto';
import { AuthenticationGuard } from 'src/auth/guards/authentication.guard';
import { AuthorizationGuard } from 'src/auth/guards/authorization.gurad';
import { UserRole } from '@prisma/client';
import { ParseBigIntPipe } from 'src/shared/pipes/parse-bigint.pipe';
import { UpdateCompetitionRequestDto } from './dto/request/UpdateCompetition-request.dto';
import { GetCompetitionsFilterDto } from './dto/request/GetCompetitionsFilter.dto';

@Controller('competitions')
@UseGuards(AuthenticationGuard)
export class CompetitionsController {
  constructor(private readonly service: CompetitionsService) {}

  @Post()
  @UseGuards(AuthorizationGuard(UserRole.ORGANIZATION))
  async create(
    @Req() req: { user: UserPayload },
    @Body() data: CreateCompetitionRequestDto,
  ) {
    return this.service.createCompetition(req.user.userId, data);
  }

  /*  @Patch(':id')
  async update(
    @Param('id', ParseBigIntPipe) eventId: bigint,
    @Req() req: { user: UserPayload },
    data: UpdateCompetitionRequestDto,
  ) {
    return this.service.updateCompetition(eventId, req.user.userId, data);
  } */

  @Delete(':id')
  @UseGuards(AuthorizationGuard(UserRole.ORGANIZATION))
  async delete(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Req() req: { user: UserPayload },
  ) {
    return this.service.deleteCompetition(id, req.user.userId);
  }

  @Get()
  async getAll(@Query() filters: GetCompetitionsFilterDto) {
    const { page, limit, ...filterData } = filters;
    return this.service.getAllCompetitions(page, limit, filterData);
  }

  @Get('option')
  async getCompetitionOption() {
    return this.service.getCompetitionOptions();
  }
  @Get(':id')
  async getCompetitionById(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.service.getCompetitionById(id);
  }
}
