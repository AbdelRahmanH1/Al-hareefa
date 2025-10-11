import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CleanUnpaidParticipantsCron {
  private readonly logger = new Logger(CleanUnpaidParticipantsCron.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleUnpaidParticipants() {
    /* const paymentWindowHours = 5;
    const cutoffTime = new Date(
      Date.now() - paymentWindowHours * 60 * 60 * 1000,
    );

    const expiredParticipants = await this.prisma.participant.findMany({
      where: {
        status: 'PENDING_PAYMENT',
        registered_at: {
          lt: new Date(cutoffTime),
        },
      },
      include: { payments: true },
    });

    for (const participant of expiredParticipants) {
      this.logger.log(`Cleaning unpaid participant ID: ${participant.id}`);

      const pendingPayment = participant.payments.filter(
        (p) => p.status == 'PENDING',
      );

      await this.prisma.$transaction([
        ...pendingPayment.map((p) =>
          this.prisma.payment.delete({ where: { id: p.id } }),
        ),
        this.prisma.participant.delete({ where: { id: participant.id } }),
      ]);
    }
    this.logger.log(
      `Cleaned ${expiredParticipants.length} unpaid participants`,
    ); */
  }
}
