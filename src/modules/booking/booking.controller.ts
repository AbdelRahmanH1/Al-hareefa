import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { BookingService } from './booking.service';
import { AuthorizationGuard } from 'src/shared/guards/authorization.gurad';
import { UserRole } from '@prisma/client';
import { UserPayload } from 'src/shared/interfaces/user-payload.interface';
import { CreateBookingRequestDto } from './dto/request/CreateBookingRequest.dto';
import { ParseBigIntPipe } from 'src/shared/pipes/parse-bigint.pipe';

@Controller('bookings')
@UseGuards(AuthenticationGuard)
export class BookingController {
  constructor(private readonly service: BookingService) {}

  @UseGuards(AuthorizationGuard(UserRole.PLAYER))
  @Post()
  async createBooking(
    @Req() req: { user: UserPayload },
    @Body() data: CreateBookingRequestDto,
  ) {
    return this.service.createBooking(req.user.userId, data);
  }

  @UseGuards(AuthorizationGuard(UserRole.PLAYER))
  @Get('my-bookings')
  async getAllBookings(@Req() req: { user: UserPayload }) {
    return this.service.getAllBookings(req.user.userId);
  }

  @UseGuards(AuthorizationGuard(UserRole.PLAYER))
  @Get(':id')
  async getBookingDetails(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.service.getBookingDetails(id);
  }

  @UseGuards(AuthorizationGuard(UserRole.PLAYER))
  @Patch(':id/cancel')
  async cancelBooking(
    @Req() req: { user: UserPayload },
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.service.cancelBooking(req.user.userId, id);
  }
}
