import { GameType } from '@prisma/client';
import { IsEnum, IsInt, IsString, Length, Max, Min } from 'class-validator';

export class CreateCompetitionType {
  @IsString()
  @Length(5, 50)
  name: string;

  @IsString()
  @Length(5, 50)
  rules: string;

  @IsEnum(GameType)
  sport: GameType;

  @IsInt()
  @Min(1, { message: 'Minimum players must be 1' })
  min_player_per_team: number;

  @IsInt()
  @Min(1)
  @Max(10, { message: 'Max player must be 10 ' })
  max_player_per_team: number;
}
