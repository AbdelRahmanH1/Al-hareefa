import { GameType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class UpdateCompetitionType {
  @IsOptional()
  @IsString()
  @Length(5, 50)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(5, 50)
  rules?: string;

  @IsOptional()
  @IsEnum(GameType)
  sport?: GameType;

  @IsOptional()
  @IsInt()
  @Min(1)
  min_player_per_team?: number;

  @IsOptional()
  @IsInt()
  @Max(10)
  max_player_per_team?: number;
}
