import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { PaymentResponse } from './dto/response/PaymentResponse.dto';
import { PaymentDataInput } from './Interface/PaymentDataInput';
import { formatPaymentResponse, processPayment } from './payment.helper';
import { Prisma } from '@prisma/client';
import { HmacService } from './Hmac.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly http: HttpService,
    private readonly prisma: PrismaService,
    private readonly hmacService: HmacService,
  ) {}

  async createPayment(userId: bigint, paymentId: bigint) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, user_id: userId },
      select: {
        id: true,
        amount: true,
        status: true,
        due_date: true,
        payment_info: true,
        bookingId: true,
        participant_id: true,
        user: { select: { phone: true, full_name: true, email: true } },
        booking: {
          select: { service: { select: { title: true, description: true } } },
        },
        participant: { select: { competition: { select: { name: true } } } },
      },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (payment.status == 'COMPLETED') {
      throw new BadRequestException('Payment already completed');
    }
    if (payment.status == 'FAILED') {
      throw new BadRequestException('Payment already failed');
    }
    const now = new Date();

    if (
      payment.status == 'PENDING' &&
      payment.due_date &&
      payment.due_date > now
    ) {
      const result = formatPaymentResponse(
        payment.payment_info,
        payment.amount,
        'EGP',
      );

      return {
        success: true,
        message: 'Existing payment link is still valid',
        data: { ...result.data },
      };
    }

    if (
      payment.status === 'PENDING' &&
      payment.due_date &&
      payment.due_date < now
    ) {
      const deleteOps: Prisma.PrismaPromise<any>[] = [];

      if (payment.bookingId) {
        deleteOps.push(
          this.prisma.playerBooking.delete({
            where: { id: payment.bookingId },
          }),
        );
      }

      if (payment.participant_id) {
        deleteOps.push(
          this.prisma.participant.delete({
            where: { id: payment.participant_id },
          }),
        );
      }

      deleteOps.push(this.prisma.payment.delete({ where: { id: payment.id } }));

      await this.prisma.$transaction(deleteOps);
      throw new BadRequestException(
        'Payment expired. You need to register again.',
      );
    }

    const paymentInput: PaymentDataInput = {
      amount: payment.amount,
      currency: 'EGP',
      serviceName:
        payment.participant?.competition?.name ||
        payment.booking?.service?.title ||
        'Unknown service',
      description: payment.booking?.service.description || 'no descirption',
      phoneNumber: payment.user.phone,
      email: payment.user.email,
      payment_id: paymentId,
      fullname: payment.user.full_name,
    };
    let result: any;
    try {
      result = await processPayment(this.http.axiosRef, paymentInput);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        payment_info: result.data,
        due_date: new Date(Date.now() + 5 * 60 * 60 * 1000),
      },
    });

    return { success: true, message: '', data: result.data };
  }

  async webhook(body: any, hmac: string) {
    const secretKey = process.env.PAYMOB_HMAC_SECRET!;

    const transactionData = body.obj;

    const isValid = this.hmacService.verify(transactionData, hmac, secretKey);

    if (!isValid) {
      throw new BadRequestException('Invalid HMAC');
    }
    const { pending, success, order } = body.obj;
    const paymentId = BigInt(order.merchant_order_id);

    if (!paymentId) {
      throw new BadRequestException('Missing payment identifier');
    }
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        booking: true,
        bookingId: true,
        participant: true,
        participant_id: true,
      },
    });

    if (!payment) throw new BadRequestException('Payment not found');

    if (!pending && success) {
      await this.prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: paymentId },
          data: { status: 'COMPLETED' },
        });

        if (payment.bookingId) {
          await tx.playerBooking.update({
            where: { id: payment.bookingId },
            data: { status: 'CONFIRMED' },
          });
        } else if (payment.participant_id) {
          await tx.participant.update({
            where: { id: payment.participant_id },
            data: { status: 'ACCEPTED' },
          });
        }
      });
    } else if (pending && !success) {
      // not pay it yet
    } else if (!pending && !success) {
      await this.prisma.$transaction(async (tx) => {
        await tx.payment.delete({ where: { id: payment.id } });

        if (payment.bookingId) {
          await tx.playerBooking.delete({ where: { id: payment.bookingId } });
        } else if (payment.participant_id) {
          await tx.participant.delete({
            where: { id: payment.participant_id },
          });
        }
      });
    }
    return { message: 'Webhook processed successfully' };
  }

  async getPaymentsByUserId(
    userId: bigint,
  ): Promise<ResponseDto<PaymentResponse[]>> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    const payments = await this.prisma.payment.findMany({
      where: { status: 'PENDING', user_id: userId },
      select: {
        id: true,
        amount: true,
        currency: true,
        booking: {
          select: {
            service: {
              select: {
                title: true,
                description: true,
              },
            },
          },
        },
        participant: {
          select: {
            competition: {
              select: {
                start_date: true,
                end_date: true,
                id: true,
                name: true,
                type: { select: { name: true } },
                venue_city: true,
              },
            },
          },
        },
      },
    });

    const plainPayments = payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      booking: payment.booking
        ? {
            service_title: payment.booking.service.title,
            service_description: payment.booking.service.description,
          }
        : undefined,
      participant: payment.participant
        ? {
            competition_id: payment.participant.competition.id,
            competition_name: payment.participant.competition.name,
            game_name: payment.participant.competition.type.name,
            place: payment.participant.competition.venue_city,
            start_date: payment.participant.competition.start_date,
            end_date: payment.participant.competition.end_date,
          }
        : undefined,
    }));

    const transformed = plainToInstance(PaymentResponse, plainPayments, {
      excludeExtraneousValues: true,
    });
    return {
      success: true,
      message: 'All user payment missing',
      data: transformed,
    };
  }
}
