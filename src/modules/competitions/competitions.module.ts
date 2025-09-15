import { Module } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CompetitionsController } from './competitions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ParticipantsService } from './participants/participants.service';
import { ParticipantsController } from './participants/participants.controller';

@Module({
  imports: [PrismaModule],
  providers: [CompetitionsService, ParticipantsService],
  controllers: [CompetitionsController, ParticipantsController],
})
export class CompetitionsModule {}
