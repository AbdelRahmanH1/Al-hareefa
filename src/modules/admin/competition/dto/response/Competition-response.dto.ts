import { Expose } from 'class-transformer';
import { ApprovalStatus, EliminationType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CompetitionResponseAdminDto {
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

  @ApiProperty()
  @Expose()
  min_age: number;

  @ApiProperty()
  @Expose()
  max_age: number;

  @ApiProperty()
  @Expose()
  max_teams: number | null;

  @ApiProperty()
  @Expose()
  eliminationType: EliminationType;

  @ApiProperty()
  @Expose()
  start_date: Date;

  @ApiProperty()
  @Expose()
  end_date: Date;

  @ApiProperty()
  @Expose()
  venue_name: string;

  @ApiProperty()
  @Expose()
  venue_address: string;

  @ApiProperty()
  @Expose()
  venue_city: string;

  @ApiProperty()
  @Expose()
  created_at: Date;
}
