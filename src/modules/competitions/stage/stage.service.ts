import { Injectable } from '@nestjs/common';
import { MatchStage } from '@prisma/client';
import { ResponseDto } from 'src/shared/dto/response.dto';

@Injectable()
export class StageService {
  async getStagesByCompetitionId(competitionId: number) {}

  async getStages(): Promise<ResponseDto<any>> {
    const stages = Object.values(MatchStage);
    return {
      success: true,
      message: 'Stages retrieved successfully',
      data: stages,
    };
  }

  getNextStage(currentStage: MatchStage): MatchStage | null {
    const stages = Object.values(MatchStage);
    const index = stages.indexOf(currentStage);
    return index === -1 || index === stages.length - 1
      ? null
      : stages[index + 1];
  }
}
