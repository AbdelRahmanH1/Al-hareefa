export const shuffleArray = <T>(arr: T[]): T[] => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const getMatchStatus = (p2?: any) => (p2 ? 'SCHEDULED' : 'COMPLETED');

export const getMatchStage = (remainingPlayers: number) =>
  remainingPlayers === 2 ? 'FINAL' : 'KNOCKOUT';
