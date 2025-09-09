import {
  IsString,
  IsEnum,
  ValidateNested,
  IsOptional,
  IsDateString,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole, GameType } from '@prisma/client';
import { GuardianDto } from './guardian.dto';

export class PlayerProfileDto {
  @IsString()
  city: string;

  @IsArray()
  @IsEnum(GameType, { each: true })
  preferredGames: GameType[];

  @IsOptional()
  @ValidateNested()
  @Type(() => GuardianDto)
  guardianId?: GuardianDto;
}
