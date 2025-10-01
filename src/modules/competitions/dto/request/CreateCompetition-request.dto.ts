import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty()
  @IsString()
  @Length(3, 100, {
    message: 'Competition name must be between 3 and 100 characters',
  })
  name: string;

  @ApiProperty()
  @IsNumber({}, { message: 'typeId must be a number' })
  typeId: number;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  start_date: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  end_date: Date;

  @ApiProperty()
  @IsString()
  @Length(3, 100, {
    message: 'Venue name must be between 3 and 100 characters',
  })
  venue_name: string;

  @ApiProperty()
  @IsString()
  @Length(5, 200, {
    message: 'Venue address must be between 5 and 200 characters',
  })
  venue_address: string;
  @ApiProperty({ enum: MatchStage })
  @IsEnum(MatchStage, { message: 'stage must be a valid MatchStage' })
  stage: MatchStage;

  @ApiProperty()
  @IsString()
  @Length(2, 50, { message: 'Venue city must be between 2 and 50 characters' })
  venue_city: string;

  @ApiProperty()
  @IsNumber({}, { message: 'organization_id must be a number' })
  organization_id: number;

  @ApiProperty({ enum: FeeType, required: false })
  @IsOptional()
  @IsEnum(FeeType, { message: 'fee_type must be a valid FeeType' })
  fee_type?: FeeType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber({}, { message: 'fee_amount must be a number' })
  @Min(0, { message: 'Fee amount cannot be negative' })
  fee_amount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber({}, { message: 'min_age must be a number' })
  @Min(7, { message: 'Minimum age must be at least 7' })
  @Max(35, { message: 'Minimum age cannot exceed 35' })
  min_age?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber({}, { message: 'max_age must be a number' })
  @Min(7, { message: 'Maximum age must be at least 7' })
  @Max(35, { message: 'Maximum age cannot exceed 35' })
  max_age?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber({}, { message: 'max_teams must be a number' })
  @Min(2, { message: 'Max teams must be at least 2' })
  max_teams?: number;

  @ApiProperty({ enum: EliminationType, required: false })
  @IsOptional()
  @IsEnum(EliminationType, {
    message: 'eliminationType must be a valid EliminationType',
  })
  eliminationType?: EliminationType;

  @ApiProperty({ required: false })
  @IsOptional()
  is_fee_per_person?: boolean;
}
