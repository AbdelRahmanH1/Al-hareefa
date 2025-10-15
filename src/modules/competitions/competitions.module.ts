import { Module } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CompetitionsController } from './competitions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ParticipantsService } from './participants/participants.service';
import { ParticipantsController } from './participants/participants.controller';
import { GroupsController } from './groups/groups.controller';
import { GroupsService } from './groups/groups.service';
import { StageService } from './stage/stage.service';
import { StageController } from './stage/stage.controller';
import { MatchesController } from './matches/matches.controller';
import { MatchesService } from './matches/matches.service';
import { KnockoutService } from './matches/knockout.service';
import { ResultService } from './matches/results.service';

@Module({
  imports: [PrismaModule],
  providers: [
    CompetitionsService,
    ParticipantsService,
    GroupsService,
    StageService,
    MatchesService,
    KnockoutService,
    ResultService,
  ],
  controllers: [
    CompetitionsController,
    ParticipantsController,
    GroupsController,
    StageController,
    MatchesController,
  ],
})
export class CompetitionsModule {}
