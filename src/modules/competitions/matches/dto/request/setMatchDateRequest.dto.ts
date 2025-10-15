import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class SetMatchScheduleDto {
  @ApiProperty()
  @IsDateString({}, { message: 'scheduledAt must be a valid ISO date string' })
  scheduledAt: string;
}
