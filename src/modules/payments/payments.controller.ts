import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserPayload } from 'src/shared/interfaces/user-payload.interface';
import { PaymentsService } from './payments.service';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { ParseBigIntPipe } from 'src/shared/pipes/parse-bigint.pipe';

@Controller('payments')
/* @UseGuards(AuthenticationGuard)
 */
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}
  @Get(':id')
  async paymentByUserId(@Param('id', ParseBigIntPipe) id) {
    return this.service.getPaymentsByUserId(id);
  }

  @Post('pay')
  async pay() {
    return this.service.createPayment(BigInt(14), BigInt(7));
  }
}
