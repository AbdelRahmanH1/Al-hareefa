import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

export class serviceDet {
  @ApiProperty()
  @Expose()
  id: bigint;

  @ApiProperty()
  @Expose()
  name: string;
}
export class BookingResponseDto {
  @ApiProperty()
  @Expose()
  id: bigint;

  @ApiProperty()
  @Expose()
  status: BookingStatus;

  @ApiProperty()
  @Expose()
  price: number;

  @ApiProperty()
  @Expose()
  scheduled_at: Date;

  @ApiProperty()
  @Type(() => serviceDet)
  @Expose()
  service: serviceDet;
}
