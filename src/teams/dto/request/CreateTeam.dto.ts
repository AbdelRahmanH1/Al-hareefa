import { GameType } from '@prisma/client';
import { IsEnum, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamRequest {
  @ApiProperty({ description: 'Team name', minLength: 3, maxLength: 10 })
  @Length(3, 10)
  name: string;

  @ApiProperty({ description: 'Game type', enum: GameType })
  @IsEnum(GameType)
  game: GameType;
}
