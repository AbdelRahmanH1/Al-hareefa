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
import { AuthenticationGuard } from 'src/auth/guards/authentication.guard';
import { AuthorizationGuard } from 'src/auth/guards/authorization.gurad';
import { UserPayload } from 'src/shared/interfaces/user-payload.interface';
import { CreateCompetitionType } from './dto/CreateCompetition-type.dto';
import { CompetitionTypeService } from './admin-competition-type.service';
import { ParseBigIntPipe } from 'src/shared/pipes/parse-bigint.pipe';
import { UpdateCompetitionType } from './dto/UpdateCompetiton-type.dto';
import { UserRole } from '@prisma/client';

@Controller('admin/competition-type')
@UseGuards(AuthenticationGuard, AuthorizationGuard(UserRole.ADMIN))
export class CompetitionTypeController {
  constructor(private readonly service: CompetitionTypeService) {}

  @Post()
  async createCompetitonType(
    @Req() req: { user: UserPayload },
    @Body() data: CreateCompetitionType,
  ) {
    return this.service.createGame(req.user.userId, data);
  }

  @Delete(':gameId')
  async deleteCompetitionType(
    @Param('gameId', ParseBigIntPipe) gameId: bigint,
  ) {
    return this.service.deleteGame(gameId);
  }

  @Patch(':gameId')
  async updateCompetitionType(
    @Param('gameId', ParseBigIntPipe) gameId: bigint,
    @Body() data: UpdateCompetitionType,
  ) {
    return this.service.updateGame(gameId, data);
  }

  @Get('option')
  async getOptions() {
    return this.service.competition_option();
  }
}
