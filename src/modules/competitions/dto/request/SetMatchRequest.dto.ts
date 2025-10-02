import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class SetMatchResultDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  scoreParticipant1: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  scoreParticipant2: number;
}
