import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MembershipsService } from './memberships/memberships.service';
import { MembershipsController } from './memberships/memberships.controller';

@Module({
  imports: [PrismaModule],
  providers: [TeamsService, MembershipsService],
  controllers: [TeamsController, MembershipsController],
})
export class TeamsModule {}
