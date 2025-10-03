import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookingRequestDto } from './dto/request/CreateBookingRequest.dto';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { plainToInstance } from 'class-transformer';
import { BookingResponseDto } from './dto/response/BookingResponse.dto';
import { BookingDetailsResponseDto } from './dto/response/BookingDetailsResponse.dto';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(userId: bigint, data: CreateBookingRequestDto) {
    const player = await this.prisma.playerProfile.findUnique({
      where: { id: userId },
    });
    if (!player) throw new NotFoundException('Player not found');

    const service = await this.prisma.coachService.findUnique({
      where: { id: data.serviceId },
    });
    if (!service) throw new NotFoundException('Service not found');

    const existing = await this.prisma.playerBooking.findFirst({
      where: {
        playerId: player.id,
        serviceId: service.id,
        end_at: { gt: new Date() },
        status: { in: ['REQUESTED', 'CONFIRMED'] },
      },
    });

    if (existing)
      throw new BadRequestException(
        'You already have an active subscription for this service',
      );

    const durationDays = service.duration ?? 30;
    const startAt = new Date();
    const endAt = new Date(
      startAt.getTime() + durationDays * 24 * 60 * 60 * 1000,
    );

    const booking = await this.prisma.playerBooking.create({
      data: {
        playerId: player.id,
        serviceId: service.id,
        status: service.price && service.price > 0 ? 'REQUESTED' : 'CONFIRMED',
        price: service.price,
        booked_at: startAt,
        start_at: startAt,
        end_at: endAt,
        notes: data.notes,
      },
    });

    if (service.price && service.price > 0) {
      await this.prisma.payment.create({
        data: {
          amount: service.price,
          user_id: userId,
          bookingId: booking.id,
          status: 'PENDING',
        },
      });
    }

    return {
      success: true,
      message: 'Service booked successfully',
      data: null,
    };
  }

  async getBookingDetails(
    id: bigint,
  ): Promise<ResponseDto<BookingDetailsResponseDto>> {
    const booking = await this.prisma.playerBooking.findUnique({
      where: { id },
      include: {
        player: {
          include: { user: { select: { full_name: true, id: true } } },
        },
        service: {
          select: { id: true, title: true, price: true },
        },
        payments: { select: { id: true, amount: true, status: true } },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    const response = plainToInstance(BookingDetailsResponseDto, booking, {
      excludeExtraneousValues: true,
    });
    return {
      success: true,
      message: 'Booking details fetched successfully',
      data: response,
    };
  }

  async getAllBookings(
    userId: bigint,
  ): Promise<ResponseDto<BookingResponseDto[]>> {
    const bookings = await this.prisma.playerBooking.findMany({
      where: { playerId: userId },
      include: { service: true },
    });

    bookings.length == 0 && new NotFoundException('No bookings found');

    const response = plainToInstance(
      BookingResponseDto,
      bookings.map((booking) => ({
        ...booking,
        service: {
          id: booking.service.id,
          name: booking.service.title,
        },
      })),
      { excludeExtraneousValues: true },
    );

    return {
      success: true,
      message: 'Bookings fetched successfully',
      data: response,
    };
  }

  async cancelBooking(
    userId: bigint,
    bookingId: bigint,
  ): Promise<ResponseDto<null>> {
    const booking = await this.prisma.playerBooking.findUnique({
      where: { id: bookingId },
      include: { service: true, payments: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.playerId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to cancel this booking',
      );
    }

    if (booking.status === 'CANCELED') {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (!booking.service.price || booking.service.price === 0) {
      await this.prisma.playerBooking.update({
        where: { id: bookingId },
        data: { status: 'CANCELED' },
      });

      return {
        success: true,
        message: 'Booking cancelled successfully',
        data: null,
      };
    }

    const pendingPayment = booking.payments.find((p) => p.status === 'PENDING');
    const successPayment = booking.payments.find(
      (p) => p.status === 'COMPLETED',
    );

    if (successPayment) {
      throw new BadRequestException(
        'Cannot cancel a booking with completed payment',
      );
    }

    if (pendingPayment) {
      await this.prisma.$transaction([
        this.prisma.playerBooking.update({
          where: { id: bookingId },
          data: { status: 'CANCELED' },
        }),
        this.prisma.payment.update({
          where: { id: pendingPayment.id },
          data: { status: 'CANCELED' },
        }),
      ]);

      return {
        success: true,
        message: 'Booking cancelled successfully',
        data: null,
      };
    }

    throw new BadRequestException(
      'Cannot cancel booking: no related payment found',
    );
  }
}
