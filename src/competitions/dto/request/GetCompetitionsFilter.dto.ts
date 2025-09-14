import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { ApprovalStatus, EliminationType, GameType } from '@prisma/client';
import { Type } from 'class-transformer';

export class GetCompetitionsFilterDto {
  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @IsOptional()
  @IsEnum(EliminationType)
  eliminationType?: EliminationType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(7)
  minAge?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(100)
  maxAge?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sport: GameType;
}
