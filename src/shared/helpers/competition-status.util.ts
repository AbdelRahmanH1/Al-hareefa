export type CompetitionStatus = 'UPCOMING' | 'ONGOING' | 'FINISHED';

export function getCompetitionStatus(
  start: Date,
  end: Date,
): CompetitionStatus {
  const now = new Date();

  if (now < start) return 'UPCOMING';
  if (now > end) return 'FINISHED';
  return 'ONGOING';
}
