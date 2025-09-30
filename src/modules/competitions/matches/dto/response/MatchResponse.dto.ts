import { MatchStage } from '@prisma/client';

export class MatchResponseDto {
  id: bigint;
  competition_id: bigint;
  participant1_id: bigint;
  participant2_id?: bigint;
  participant1_name: string;
  participant2_name: string;
  stage: MatchStage | null;
}
