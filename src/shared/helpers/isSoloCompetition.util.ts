import { Competition } from '@prisma/client';

export const isSoloCompetition = (competition: Competition & { type: any }) => {
  return (
    competition.type.min_player_per_team === 1 &&
    competition.type.max_player_per_team === 1
  );
};
