import { EliminationType, FeeType, MatchStage } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateCompetitionRequestDto {
  @IsString()
  @Length(3, 100, {
    message: 'Competition name must be between 3 and 100 characters',
  })
  name: string;

  @IsNumber({}, { message: 'typeId must be a number' })
  typeId: number;

  @IsDate()
  @Type(() => Date)
  start_date: Date;

  @IsDate()
  @Type(() => Date)
  end_date: Date;

  @IsString()
  @Length(3, 100, {
    message: 'Venue name must be between 3 and 100 characters',
  })
  venue_name: string;

  @IsString()
  @Length(5, 200, {
    message: 'Venue address must be between 5 and 200 characters',
  })
  venue_address: string;

  @IsEnum(MatchStage, { message: 'stage must be a valid MatchStage' })
  stage: MatchStage;

  @IsString()
  @Length(2, 50, { message: 'Venue city must be between 2 and 50 characters' })
  venue_city: string;

  @IsNumber({}, { message: 'organization_id must be a number' })
  organization_id: number;

  @IsOptional()
  @IsEnum(FeeType, { message: 'fee_type must be a valid FeeType' })
  fee_type?: FeeType;

  @IsOptional()
  @IsNumber({}, { message: 'fee_amount must be a number' })
  @Min(0, { message: 'Fee amount cannot be negative' })
  fee_amount?: number;

  @IsOptional()
  @IsNumber({}, { message: 'min_age must be a number' })
  @Min(7, { message: 'Minimum age must be at least 7' })
  @Max(35, { message: 'Minimum age cannot exceed 35' })
  min_age?: number;

  @IsOptional()
  @IsNumber({}, { message: 'max_age must be a number' })
  @Min(7, { message: 'Maximum age must be at least 7' })
  @Max(35, { message: 'Maximum age cannot exceed 35' })
  max_age?: number;

  @IsOptional()
  @IsNumber({}, { message: 'max_teams must be a number' })
  @Min(2, { message: 'Max teams must be at least 2' })
  max_teams?: number;

  @IsOptional()
  @IsEnum(EliminationType, {
    message: 'eliminationType must be a valid EliminationType',
  })
  eliminationType?: EliminationType;

  @IsOptional()
  is_fee_per_person?: boolean;
}
