import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { HttpModule } from '@nestjs/axios';
import { HmacService } from './Hmac.service';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [HttpModule],
  providers: [PaymentsService, HmacService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
