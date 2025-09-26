import { Expose } from 'class-transformer';
import { ApprovalStatus, EliminationType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CompetitionResponseDto {
  @ApiProperty()
  @Expose()
  id: bigint;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  typeId: bigint;

  @ApiProperty()
  @Expose()
  organization_id: bigint;

  @ApiProperty()
  @Expose()
  organization_name: string;

  @ApiProperty()
  @Expose()
  approval_status: ApprovalStatus;

  @ApiProperty()
  @Expose()
  price: number;

  @Expose()
  min_age: number;

  @Expose()
  max_age: number;

  @Expose()
  max_teams: number | null;

  @Expose()
  eliminationType: EliminationType;

  @Expose()
  start_date: Date;

  @Expose()
  end_date: Date;

  @Expose()
  venue_name: string;

  @Expose()
  venue_address: string;

  @Expose()
  venue_city: string;

  @Expose()
  created_at: Date;
}
