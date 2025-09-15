import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { TeamsModule } from './modules/teams/teams.module';
import { AdminModule } from './modules/admin/admin.module';
import { CompetitionsModule } from './modules/competitions/competitions.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    RedisModule,
    TeamsModule,
    AdminModule,
    CompetitionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
