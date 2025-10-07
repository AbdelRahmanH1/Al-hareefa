import {
  IsEnum,
  ValidateNested,
  IsOptional,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GameType } from '@prisma/client';
import { CreateGuardianRequestDto } from './CreateGuardian-request.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlayerProfileRequestDto {
  @ApiProperty()
  @IsArray()
  @IsEnum(GameType, { each: true })
  @ArrayMinSize(1, { message: 'At least one game must be selected' })
  preferred_games: GameType[];

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateGuardianRequestDto)
  guardian?: CreateGuardianRequestDto;
}
