import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CleanExpiredPaymentsCron {
  private readonly logger = new Logger(CleanExpiredPaymentsCron.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_10_HOURS)
  async handleExpiredPayments() {
    const now = new Date();

    const expiredPayments = await this.prisma.payment.findMany({
      where: {
        status: 'PENDING',
        due_date: { lt: now },
      },
      include: {
        participant: true,
        booking: true,
      },
    });

    if (expiredPayments.length === 0) {
      return;
    }

    this.logger.verbose(
      `Found ${expiredPayments.length} expired payments to clean.`,
    );

    await this.prisma.$transaction(async (tx) => {
      for (const payment of expiredPayments) {
        if (payment.participant) {
          await tx.participant.delete({
            where: { id: payment.participant.id },
          });
        }

        if (payment.booking) {
          await tx.playerBooking.delete({
            where: { id: payment.booking.id },
          });
        }

        await tx.payment.delete({
          where: { id: payment.id },
        });
      }
    });

    this.logger.verbose(
      `✅ Cleaned ${expiredPayments.length} expired payments and related records.`,
    );
  }
}
