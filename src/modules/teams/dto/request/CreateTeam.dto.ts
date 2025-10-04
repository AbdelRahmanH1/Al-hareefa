import { GameType } from '@prisma/client';
import { IsEnum, IsOptional, IsUrl, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamRequest {
  @ApiProperty({ description: 'Team name', minLength: 3, maxLength: 10 })
  @Length(3, 10)
  name: string;

  @ApiProperty({ description: 'Game type', enum: GameType })
  @IsEnum(GameType)
  game: GameType;

  @ApiProperty({ description: 'Photo URL', required: false })
  @IsOptional()
  @IsUrl({}, { message: 'Photo URL must be a valid URL' })
  logo?: string;
}
