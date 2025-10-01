import {
  IsString,
  IsEnum,
  ValidateNested,
  IsOptional,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GameType } from '@prisma/client';
import { CreateGuardianRequestDto } from './CreateGuardian-request.dto';

export class CreatePlayerProfileRequestDto {
  @IsArray()
  @IsEnum(GameType, { each: true })
  @ArrayMinSize(1, { message: 'At least one game must be selected' })
  preferredGames: GameType[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateGuardianRequestDto)
  guardianId?: CreateGuardianRequestDto;
}
