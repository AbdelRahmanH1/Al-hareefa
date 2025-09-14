import { GameType } from '@prisma/client';
import { IsEnum, IsOptional, Length } from 'class-validator';

export class UpdateTeamRequest {
  @IsOptional()
  @Length(3, 10)
  name: string;

  @IsOptional()
  @IsEnum(GameType)
  game: GameType;
}
