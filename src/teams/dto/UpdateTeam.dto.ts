import { IsEnum, IsOptional, Length } from 'class-validator';
import { GameType } from 'generated/prisma';

export class UpdateTeamRequest {
  @IsOptional()
  @Length(3, 10)
  name: string;

  @IsOptional()
  @IsEnum(GameType)
  game: GameType;
}
