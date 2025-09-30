import { MatchStage } from '@prisma/client';

export class ParticipantInfoDto {
  id: bigint;
  name: string;
}

export class AllMatchResponseDto {
  id: bigint;
  competitionId: bigint;

  participant1: ParticipantInfoDto;
  participant2: ParticipantInfoDto | null;

  stage: MatchStage | null;
  status: string;

  scheduledAt: Date | null;

  venueName?: string | null;
  venueAddress?: string | null;
  venueCity?: string | null;

  scoreParticipant1?: number | null;
  scoreParticipant2?: number | null;
  winnerParticipantId?: bigint | null;
}
