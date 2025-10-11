import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { TeamsModule } from './modules/teams/teams.module';
import { AdminModule } from './modules/admin/admin.module';
import { CompetitionsModule } from './modules/competitions/competitions.module';
import { ServicesController } from './modules/services/services.controller';
import { ServicesService } from './modules/services/services.service';
import { ServicesModule } from './modules/services/services.module';
import { BookingModule } from './modules/booking/booking.module';
import { PaymentsService } from './modules/payments/payments.service';
import { PaymentsController } from './modules/payments/payments.controller';
import { PaymentsModule } from './modules/payments/payments.module';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanUnpaidParticipantsCron } from './modules/competitions/participants/cron/clean-unpaid.participants.cron';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    TeamsModule,
    AdminModule,
    CompetitionsModule,
    ServicesModule,
    BookingModule,
    PaymentsModule,
    HttpModule,
  ],
  controllers: [],
  providers: [CleanUnpaidParticipantsCron],
})
export class AppModule {}
