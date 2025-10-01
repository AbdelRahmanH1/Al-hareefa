import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(5, 50)
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(5, 50)
  rules?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(GameType)
  sport?: GameType;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @Min(1)
  min_player_per_team?: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @Max(10)
  max_player_per_team?: number;
}
