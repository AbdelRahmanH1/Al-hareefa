import { Competition, Participant } from '@prisma/client';

export const canCancelParticipation = (
  participant: Participant,
  competition: Competition,
) => {
  const isFree = !competition.fee_amount || competition.fee_amount === 0;

  if (isFree) {
    return participant.status === 'REJECTED';
  }

  return participant.status === 'PENDING';
};
