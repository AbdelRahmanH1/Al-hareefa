import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class OrganizationProfileResponseDto {
  @ApiProperty()
  @Expose()
  id: string;
  @ApiProperty()
  @Expose()
  user_id: string;
  @ApiProperty()
  @Expose()
  owner_name: string;
  @ApiProperty()
  @Expose()
  type: string;
  @ApiProperty()
  @Expose()
  district: string;
  @ApiProperty()
  @Expose()
  street_address: string;
  @ApiProperty()
  @Expose()
  google_map_link?: string;
  @ApiProperty()
  @Expose()
  approval_status: string;
}
