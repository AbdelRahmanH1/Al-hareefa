import { ApiProperty } from '@nestjs/swagger';
import { GameType } from '@prisma/client';
import { IsEnum, IsOptional, Length } from 'class-validator';

export class UpdateTeamRequest {
  @ApiProperty({
    description: 'Team name',
    minLength: 3,
    maxLength: 10,
    required: false,
  })
  @IsOptional()
  @Length(3, 10)
  name: string;

  @ApiProperty({ description: 'Game type', enum: GameType, required: false })
  @IsOptional()
  @IsEnum(GameType)
  game: GameType;
}
