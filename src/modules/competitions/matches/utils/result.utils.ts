import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { updateGroupStanding } from 'src/shared/helpers/calculateStandings.util';
import { Prisma } from '@prisma/client';

export class ResultUtils {
  constructor() {}

  async fetchAndValidateMatch(
    userId: bigint,
    matchId: bigint,
    prisma: Prisma.TransactionClient,
  ) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        competition: { select: { organization_id: true } },
        status: true,
        stage: true,
        group_id: true,
        participant1_id: true,
        participant2_id: true,
        participant1: {
          select: {
            id: true,
            player: {
              select: { user: { select: { id: true, full_name: true } } },
            },
          },
        },
        participant2: {
          select: {
            id: true,
            player: {
              select: { user: { select: { id: true, full_name: true } } },
            },
          },
        },
      },
    });

    if (!match) throw new NotFoundException('Match not found');
    if (match.competition.organization_id !== userId)
      throw new ForbiddenException('Not authorized');
    if (match.status === 'COMPLETED')
      throw new BadRequestException('Result already set');

    return match;
  }

  computeWinner(
    match: any,
    scoreParticipant1: number,
    scoreParticipant2: number,
  ) {
    if (
      match.stage !== 'GROUP_STAGE' &&
      scoreParticipant1 === scoreParticipant2
    ) {
      throw new BadRequestException('Draw not allowed');
    }

    if (scoreParticipant1 === scoreParticipant2) return null;
    return scoreParticipant1 > scoreParticipant2
      ? match.participant1_id
      : match.participant2_id;
  }

  async updateMatchAndStandings(
    match: any,
    winnerId: bigint | null,
    scoreParticipant1: number,
    scoreParticipant2: number,
    prisma: Prisma.TransactionClient,
  ) {
    const updated = await prisma.match.update({
      where: { id: match.id },
      data: {
        score_participant1: scoreParticipant1,
        score_participant2: scoreParticipant2,
        winner_participant_id: winnerId,
        status: 'COMPLETED',
      },
      select: {
        id: true,
        stage: true,
        status: true,
        participant1: {
          select: {
            id: true,
            player: { select: { user: { select: { full_name: true } } } },
          },
        },
        participant2: {
          select: {
            id: true,
            player: { select: { user: { select: { full_name: true } } } },
          },
        },
        score_participant1: true,
        score_participant2: true,
        winner_participant_id: true,
        competition_id: true,
      },
    });

    if (match.stage === 'GROUP_STAGE' && match.group_id) {
      await updateGroupStanding({
        prisma,
        matchId: match.id,
        scoreParticipant1,
        scoreParticipant2,
        participant1Id: match.participant1_id!,
        participant2Id: match.participant2_id!,
        groupId: match.group_id!,
      });
    }

    return updated;
  }

  formatResponse(updatedMatch: any) {
    return {
      id: updatedMatch.id.toString(),
      competitionId: updatedMatch.competition_id.toString(),
      stage: updatedMatch.stage,
      status: updatedMatch.status,
      participant1: {
        id: updatedMatch.participant1.id,
        name: updatedMatch.participant1.player?.user?.full_name ?? 'Unknown',
      },
      participant2: {
        id: updatedMatch?.participant2.id ?? 0,
        name: updatedMatch?.participant2?.player?.user?.full_name ?? 'Unknown',
      },
      scoreParticipant1: updatedMatch.score_participant1,
      scoreParticipant2: updatedMatch.score_participant2,
      winnerParticipantId:
        updatedMatch.winner_participant_id?.toString() ?? null,
    };
  }
}
