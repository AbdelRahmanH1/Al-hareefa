import { Expose } from 'class-transformer';
import { ApprovalStatus, OrganizationType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class OrganizationResponseDto {
  @ApiProperty()
  @Expose()
  id: bigint;

  @ApiProperty()
  @Expose()
  owner_name: string;

  @ApiProperty()
  @Expose()
  type: OrganizationType;

  @ApiProperty()
  @Expose()
  district: string;

  @ApiProperty()
  @Expose()
  street_address: string;

  @ApiProperty()
  @Expose()
  address_description?: string | null;

  @ApiProperty()
  @Expose()
  google_map_link?: string | null;

  @ApiProperty()
  @Expose()
  approval_status: ApprovalStatus;

  @ApiProperty()
  @Expose()
  created_at: Date;
}
