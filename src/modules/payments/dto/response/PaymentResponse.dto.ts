import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ParicipationPaymentDto {
  @ApiProperty()
  @Expose()
  competition_id: bigint;

  @ApiProperty()
  @Expose()
  competition_name: string;

  @ApiProperty()
  @Expose()
  game_name: string;

  @ApiProperty()
  @Expose()
  place: string;

  @ApiProperty()
  @Expose()
  start_date: Date;

  @ApiProperty()
  @Expose()
  end_date: Date;
}
export class BookingPaymentDto {
  @ApiProperty()
  @Expose()
  service_title: string;
  @ApiProperty()
  @Expose()
  service_description: string;
}

export class PaymentResponse {
  @ApiProperty()
  @Expose()
  id: bigint;

  @ApiProperty()
  @Expose()
  @Type(() => ParicipationPaymentDto)
  participant?: ParicipationPaymentDto;

  @ApiProperty()
  @Expose()
  @Type(() => BookingPaymentDto)
  booking?: BookingPaymentDto;

  @ApiProperty()
  @Expose()
  amount: number;

  @ApiProperty()
  @Expose()
  currency: string;
}
