import { ApiProperty } from '@nestjs/swagger';
import { GameType } from '@prisma/client';
import { IsEnum, IsInt, IsString, Length, Max, Min } from 'class-validator';

export class CreateCompetitionType {
  @ApiProperty({ required: true })
  @IsString()
  @Length(5, 50)
  name: string;

  @ApiProperty({ required: true })
  @IsString()
  @Length(5, 50)
  rules: string;

  @ApiProperty({ enumName: 'GameTypes', enum: GameType, required: true })
  @IsEnum(GameType)
  sport: GameType;

  @ApiProperty({ required: true })
  @IsInt()
  @Min(1, { message: 'Minimum players must be 1' })
  min_player_per_team: number;

  @ApiProperty({ required: true })
  @IsInt()
  @Min(1)
  @Max(10, { message: 'Max player must be 10 ' })
  max_player_per_team: number;
}
