import { BadRequestException, ConflictException } from '@nestjs/common';
import { Competition, Participant } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export class MatchUtil {
  constructor(private readonly prisma: PrismaService) {}

  async validateParticipants(
    competition: Competition & { participants: Participant[] },
    participantIds: bigint[],
  ) {
    const participantSet = new Set(
      competition?.participants.map((p) => p.id.toString()) ?? [],
    );
    for (const id of participantIds) {
      if (!participantSet.has(id.toString()))
        throw new BadRequestException('Participant not in competition');
    }
    return competition;
  }

  async checkDuplicateMatch(
    competitionId: bigint,
    p1: bigint,
    p2: bigint,
    excludeMatchId?: bigint,
  ) {
    const existingMatch = await this.prisma.match.findFirst({
      where: {
        competition_id: competitionId,
        id: excludeMatchId ? { not: excludeMatchId } : undefined,
        OR: [
          { participant1_id: p1, participant2_id: p2 },
          { participant1_id: p2, participant2_id: p1 },
        ],
      },
    });
    if (existingMatch) throw new ConflictException('Duplicate match exists');
  }

  async checkScheduleConflict(
    competitionId: bigint,
    participantIds: bigint[],
    scheduledAt: Date,
    excludeMatchId?: bigint,
  ) {
    const orConditions = participantIds.flatMap((id) => [
      { participant1_id: id },
      { participant2_id: id },
    ]);

    const conflict = await this.prisma.match.findFirst({
      where: {
        competition_id: competitionId,
        scheduled_at: scheduledAt,
        id: excludeMatchId ? { not: excludeMatchId } : undefined,
        OR: orConditions.length > 0 ? orConditions : undefined,
      },
    });

    if (conflict)
      throw new ConflictException('Scheduling conflict for participant(s)');
  }
}
