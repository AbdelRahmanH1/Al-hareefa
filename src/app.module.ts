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

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TeamsModule,
    AdminModule,
    CompetitionsModule,
    ServicesModule,
    BookingModule,
    PaymentsModule,
  ],
  controllers: [ServicesController, PaymentsController],
  providers: [ServicesService, PaymentsService],
})
export class AppModule {}
