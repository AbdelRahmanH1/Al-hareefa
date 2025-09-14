import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { TeamsModule } from './teams/teams.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [PrismaModule, AuthModule, RedisModule, TeamsModule, AdminModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
