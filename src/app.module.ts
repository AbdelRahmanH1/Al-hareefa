import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TeamsModule } from './modules/teams/teams.module';
import { AdminModule } from './modules/admin/admin.module';
import { CompetitionsModule } from './modules/competitions/competitions.module';
import { ServicesModule } from './modules/services/services.module';
import { BookingModule } from './modules/booking/booking.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanExpiredPaymentsCron } from './modules/competitions/participants/cron/clean-unpaid.participants.cron';

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
  providers: [CleanExpiredPaymentsCron],
})
export class AppModule {}
