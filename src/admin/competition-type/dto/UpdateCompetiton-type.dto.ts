import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { GameType } from 'generated/prisma';

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
