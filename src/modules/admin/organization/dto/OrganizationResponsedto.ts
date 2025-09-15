import { Expose } from 'class-transformer';
import { ApprovalStatus, OrganizationType } from '@prisma/client';

export class OrganizationResponseDto {
  @Expose()
  id: bigint;

  @Expose()
  owner_name: string;

  @Expose()
  type: OrganizationType;

  @Expose()
  district: string;

  @Expose()
  street_address: string;

  @Expose()
  address_description?: string | null;

  @Expose()
  google_map_link?: string | null;

  @Expose()
  approval_status: ApprovalStatus;

  @Expose()
  created_at: Date;
}
