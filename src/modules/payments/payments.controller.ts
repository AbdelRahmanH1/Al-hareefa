import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserPayload } from 'src/shared/interfaces/user-payload.interface';
import { PaymentsService } from './payments.service';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { ParseBigIntPipe } from 'src/shared/pipes/parse-bigint.pipe';
import { AuthorizationGuard } from 'src/shared/guards/authorization.gurad';
import { User, UserRole } from '@prisma/client';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}
  @UseGuards(
    AuthenticationGuard,
    AuthorizationGuard(UserRole.PLAYER, UserRole.COACH),
  )
  @Get(':id')
  async paymentByUserId(@Param('id', ParseBigIntPipe) id) {
    return this.service.getPaymentsByUserId(id);
  }
  @UseGuards(
    AuthenticationGuard,
    AuthorizationGuard(UserRole.PLAYER, UserRole.COACH),
  )
  @Post('pay/:paymentId')
  async pay(
    @Req() req: { user: UserPayload },
    @Param('paymentId', ParseBigIntPipe) paymentId: bigint,
  ) {
    return this.service.createPayment(req.user.userId, paymentId);
  }

  @Post('webhook')
  async handleWebhook(@Body() data: any, @Query('hmac') hamc: string) {
    return this.service.webhook(data, hamc);
  }
}
