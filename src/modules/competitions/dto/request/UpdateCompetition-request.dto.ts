import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  Max,
  Length,
  IsDateString,
  IsDate,
} from 'class-validator';
import { FeeType, EliminationType } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateCompetitionRequestDto {
  @IsOptional()
  @IsString()
  @Length(3, 100)
  name?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  start_date?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  end_date?: Date;

  @IsOptional()
  @IsString()
  @Length(3, 100)
  venue_name?: string;

  @IsOptional()
  @IsString()
  @Length(5, 200)
  venue_address?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  venue_city?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fee_amount?: number;

  @IsOptional()
  @IsEnum(FeeType)
  fee_type?: FeeType;

  @IsOptional()
  @IsNumber()
  @Min(7)
  @Max(35)
  min_age?: number;

  @IsOptional()
  @IsNumber()
  @Min(7)
  @Max(35)
  max_age?: number;

  @IsOptional()
  @IsNumber()
  @Min(2)
  max_teams?: number;

  @IsOptional()
  @IsEnum(EliminationType)
  eliminationType?: EliminationType;
}
