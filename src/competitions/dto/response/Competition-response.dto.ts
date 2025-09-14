import { Expose } from 'class-transformer';
import { ApprovalStatus, EliminationType, FeeType } from '@prisma/client';

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
  organization_name?: string;

  @Expose()
  approval_status: ApprovalStatus;

  @Expose()
  fee_type: FeeType;

  @Expose()
  fee_amount?: number;

  @Expose()
  is_fee_per_person?: boolean;

  @Expose()
  min_age: number;

  @Expose()
  max_age: number;

  @Expose()
  max_teams?: number;

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

  @Expose()
  status?: string;
}
