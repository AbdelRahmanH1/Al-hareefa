import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [PaymentsService],
})
export class PaymentsModule {}
