import { Expose } from 'class-transformer';
import { ApprovalStatus, EliminationType } from '@prisma/client';

export class CompetitionResponseDto {
  @Expose()
  id: bigint;

  @Expose()
  name: string;

  @Expose()
  typeId: bigint;

  @Expose()
  organization_id: bigint;

  @Expose()
  organization_name: string;

  @Expose()
  approval_status: ApprovalStatus;

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
