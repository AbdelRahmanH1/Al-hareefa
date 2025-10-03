import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class CreateBookingRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  serviceId: number;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  scheduled_at?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  notes?: string;
}
