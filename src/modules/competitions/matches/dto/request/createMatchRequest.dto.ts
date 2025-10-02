import { ApiProperty } from '@nestjs/swagger';
import { MatchStage } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsString, Length } from 'class-validator';

export class CreateMatchRequestDto {
  @ApiProperty()
  @IsNumber({}, { message: 'participant1Id must be a number' })
  participant1Id: bigint;

  @ApiProperty()
  @IsNumber({}, { message: 'participant2Id must be a number' })
  participant2Id: bigint;

  @ApiProperty({ enum: MatchStage })
  @IsEnum(MatchStage, { message: 'stage must be a valid MatchStage' })
  stage: MatchStage;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  scheduledAt?: Date;

  @ApiProperty()
  @IsString()
  @Length(3, 100, {
    message: 'Venue name must be between 3 and 100 characters',
  })
  venueName?: string;

  @ApiProperty()
  @IsString()
  @Length(5, 200, {
    message: 'Venue address must be between 5 and 200 characters',
  })
  venueAddress?: string;

  @ApiProperty()
  @IsString()
  @Length(2, 50, { message: 'Venue city must be between 2 and 50 characters' })
  venueCity?: string;
}
