import { PrismaService } from 'src/prisma/prisma.service';

interface UpdateGroupStandingParams {
  prisma: PrismaService;
  matchId: bigint;
  scoreParticipant1: number;
  scoreParticipant2: number;
  participant1Id: bigint;
  participant2Id: bigint;
  groupId: bigint;
}

export async function updateGroupStanding({
  prisma,
  scoreParticipant1,
  scoreParticipant2,
  participant1Id,
  participant2Id,
  groupId,
}: UpdateGroupStandingParams) {
  const isDraw = scoreParticipant1 === scoreParticipant2;

  const standingsData = [
    {
      participantId: participant1Id,
      points: isDraw ? 1 : scoreParticipant1 > scoreParticipant2 ? 3 : 0,
      wins: scoreParticipant1 > scoreParticipant2 ? 1 : 0,
      losses: scoreParticipant1 < scoreParticipant2 ? 1 : 0,
    },
    {
      participantId: participant2Id,
      points: isDraw ? 1 : scoreParticipant2 > scoreParticipant1 ? 3 : 0,
      wins: scoreParticipant2 > scoreParticipant1 ? 1 : 0,
      losses: scoreParticipant2 < scoreParticipant1 ? 1 : 0,
    },
  ];

  for (const s of standingsData) {
    await prisma.groupStanding.upsert({
      where: {
        groupId_participantId: {
          groupId,
          participantId: s.participantId,
        },
      },
      update: {
        points: { increment: s.points },
        wins: { increment: s.wins },
        losses: { increment: s.losses },
      },
      create: {
        groupId,
        participantId: s.participantId,
        points: s.points,
        wins: s.wins,
        losses: s.losses,
      },
    });
  }
}
