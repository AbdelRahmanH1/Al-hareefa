import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { PaymentResponse } from './dto/response/PaymentResponse.dto';
import { PaymentDataInput } from './Interface/PaymentDataInput';
import {
  buildPaymentData,
  createPaymentIntention,
  formatPaymentResponse,
  processPayment,
} from './payment.helper';
import { PAYMOB_CONFIG } from './payyment.constants';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly http: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  /*  async createPaymentIntentionAndGetCheckoutLink1() {
    const url = `${this.baseUrl}/v1/intention`;
    const headers = {
      Authorization: `Token ${this.secretKey}`,
      'Content-Type': 'application/json',
    };

    const testPaymentData = {
      amount: 1000,
      currency: 'EGP',
      payment_methods: [5352630, 5350788, 5350792],
      items: [
        {
          name: 'Test Coach Service',
          amount: 1000,
          description: 'Payment for testing',
          quantity: 1,
        },
      ],
      customer: {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        phone_number: '01010101010',
      },
      billing_data: {
        apartment: '6',
        first_name: 'Test',
        last_name: 'User',
        street: '123 Test St',
        building: '1',
        phone_number: '01010101010',
        country: 'EGY',
        email: 'test@example.com',
        floor: '1',
        state: 'Cairo',
      },
    };

    try {
      const response = await this.http.axiosRef.post(url, testPaymentData, {
        headers,
      });
      const data = response.data;

      const checkoutLink = `https://accept.paymob.com/unifiedcheckout/?publicKey=${this.publicKey}&clientSecret=${data.client_secret}`;

      return {
        success: true,
        message: 'Payment intention created successfully',
        data: {
          intention_id: data.id,
          client_secret: data.client_secret,
          checkout_link: checkoutLink,
          amount: testPaymentData.amount,
          currency: testPaymentData.currency,
        },
      };
    } catch (error) {
      console.error(
        '❌ Error creating payment intention:',
        error.response?.data || error.message,
      );
      return {
        success: false,
        message: 'Failed to create payment intention',
        error: error.response?.data || error.message,
      };
    }
  } */

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

    const now = new Date();

    if (
      payment.status == 'PENDING' &&
      payment.due_date &&
      payment.due_date > now
    ) {
      const paymentInfo = payment.payment_info as {
        intention_id: string;
        client_secret: string;
        checkout_link: string;
      };

      return {
        success: true,
        message: 'Existing payment link is still valid',
        data: {
          intention_id: paymentInfo.intention_id,
          client_secret: paymentInfo!.client_secret!,
          checkout_link: paymentInfo!.checkout_link!,
          amount: payment.amount,
          currency: 'EGP',
        },
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

    return { success: true, message: '', data: result };
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
