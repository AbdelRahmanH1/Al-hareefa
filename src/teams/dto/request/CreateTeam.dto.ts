import { GameType } from '@prisma/client';
import { IsEnum, Length } from 'class-validator';

export class CreateTeamRequest {
  @Length(3, 10)
  name: string;
  @IsEnum(GameType)
  game: GameType;
}
