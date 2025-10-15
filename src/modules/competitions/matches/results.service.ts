import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SetMatchResultDto } from '../dto/request/SetMatchRequest.dto';
import { ResultUtils } from './utils/result.utils';

@Injectable()
export class ResultService {
  private readonly utils: ResultUtils;
  constructor(private readonly prisma: PrismaService) {
    this.utils = new ResultUtils();
  }

  async setResult(userId: bigint, matchId: bigint, data: SetMatchResultDto) {
    const { scoreParticipant1, scoreParticipant2 } = data;
    const updateMatch = await this.prisma.$transaction(async (prisma) => {
      const match = await this.utils.fetchAndValidateMatch(
        userId,
        matchId,
        prisma,
      );
      const winnerId = await this.utils.computeWinner(
        match,
        scoreParticipant1,
        scoreParticipant2,
      );
      return this.utils.updateMatchAndStandings(
        match,
        winnerId,
        scoreParticipant1,
        scoreParticipant2,
        prisma,
      );
    });

    return {
      success: true,
      message: 'Match result set seccessfully',
      data: this.utils.formatResponse(updateMatch),
    };
  }
}
