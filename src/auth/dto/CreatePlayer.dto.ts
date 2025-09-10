import {
  IsString,
  IsEnum,
  ValidateNested,
  IsOptional,
  IsDateString,
  IsArray,
  IsNumber,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GameType } from '@prisma/client';
import { CreateGuardianDto } from './CreateGuardian.dto';

export class CreatePlayerProfileDto {
  @IsString()
  city: string;

  @IsArray()
  @IsEnum(GameType, { each: true })
  @ArrayMinSize(1, { message: 'At least one game must be selected' })
  preferredGames: GameType[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateGuardianDto)
  guardianId?: CreateGuardianDto;
}
