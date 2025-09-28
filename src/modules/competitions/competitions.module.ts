import { Module } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CompetitionsController } from './competitions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ParticipantsService } from './participants/participants.service';
import { ParticipantsController } from './participants/participants.controller';
import { GroupsController } from './groups/groups.controller';
import { GroupsService } from './groups/groups.service';

@Module({
  imports: [PrismaModule],
  providers: [CompetitionsService, ParticipantsService, GroupsService],
  controllers: [CompetitionsController, ParticipantsController, GroupsController],
})
export class CompetitionsModule {}
