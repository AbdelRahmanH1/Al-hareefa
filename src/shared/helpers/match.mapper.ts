import { Match, Participant, PlayerProfile, Team, User } from '@prisma/client';
import { AllMatchResponseDto } from 'src/modules/competitions/matches/dto/response/allMatchsResponse.dto';

export function mapMatchToDto(
  match: Match & {
    participant1: Participant & {
      team: Team | null;
      player: (PlayerProfile & { user: User }) | null;
    };
    participant2:
      | (Participant & {
          team: Team | null;
          player: (PlayerProfile & { user: User }) | null;
        })
      | null;
  },
): AllMatchResponseDto {
  const { participant1: p1, participant2: p2 } = match;
  return {
    id: match.id.toString(),
    competitionId: match.competition_id.toString(),
    participant1: {
      id: p1.id.toString(),
      name: p1.team?.name || p1.player?.user.full_name || '',
    },
    participant2: p2
      ? {
          id: p2.id.toString(),
          name: p2.team?.name || p2.player?.user.full_name || '',
        }
      : null,
    stage: match.stage,
    status: match.status,
    scheduledAt: match.scheduled_at,
    venueName: match.venue_name,
    venueAddress: match.venue_address,
    venueCity: match.venue_city,
    scoreParticipant1: match.score_participant1 ?? undefined,
    scoreParticipant2: match.score_participant2 ?? undefined,
    winnerParticipantId: match.winner_participant_id
      ? match.winner_participant_id.toString()
      : null,
  };
}
