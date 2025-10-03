import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class PlayerResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;
}

export class ServiceResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  price: number;
}

export class PaymentResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  amount: number;

  @ApiProperty()
  @Expose()
  status: string;
}

export class BookingDetailsResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  price: number;

  @ApiProperty()
  @Expose()
  scheduled_at: Date;

  @ApiProperty({ required: false })
  @Expose()
  notes?: string;

  @ApiProperty()
  @Expose()
  booked_at: Date;

  @ApiProperty({ type: () => PlayerResponseDto })
  @Expose()
  @Type(() => PlayerResponseDto)
  player: PlayerResponseDto;

  @ApiProperty({ type: () => ServiceResponseDto })
  @Expose()
  @Type(() => ServiceResponseDto)
  service: ServiceResponseDto;

  @ApiProperty({ type: () => [PaymentResponseDto], required: false })
  @Expose()
  @Type(() => PaymentResponseDto)
  payments?: PaymentResponseDto[];
}
