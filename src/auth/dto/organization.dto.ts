import { IsString } from 'class-validator';

export class OrganizationProfileDto {
  @IsString()
  ownerName: string;
}
