import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class CoachDto {
  @ApiProperty()
  @Expose()
  id: bigint;

  @ApiProperty()
  @Expose()
  name: string;
}

export class ServiceResponseDto {
  @ApiProperty()
  @Expose()
  id: bigint;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  price: number;

  @ApiProperty({ type: CoachDto })
  @Expose()
  @Type(() => CoachDto)
  coach: CoachDto;

  @ApiProperty()
  @Expose()
  created_at: Date;

  @ApiProperty()
  @Expose()
  updated_at: Date;
}
