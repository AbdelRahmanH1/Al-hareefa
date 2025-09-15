import { GameType } from '@prisma/client';
import { Expose } from 'class-transformer';

export class CompetitionTypeResponseDto {
  @Expose()
  id: bigint;

  @Expose()
  name: string;

  @Expose()
  rules: string;

  @Expose()
  sport: GameType;

  @Expose()
  min_player_per_team: number;

  @Expose()
  max_player_per_team: number;

  @Expose()
  created_at: Date;
}
