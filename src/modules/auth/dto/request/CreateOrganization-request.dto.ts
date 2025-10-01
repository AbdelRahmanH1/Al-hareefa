import { OrganizationType } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateOrganizationProfileRequestDto {
  @IsString()
  @MinLength(3, { message: 'Organizer name must be at least 3 character long' })
  @MaxLength(50, { message: 'Organizer name must be exceed 30 character' })
  owner_name: string;

  @IsEnum(OrganizationType)
  type: OrganizationType;

  @IsString()
  @MinLength(2, { message: 'District must be at least 2 characters long' })
  @MaxLength(50, { message: 'District cannot exceed 50 characters' })
  district: string;

  @IsString()
  @MinLength(3, {
    message: 'Street address must be at least 3 characters long',
  })
  @MaxLength(100, { message: 'Street address cannot exceed 100 characters' })
  street_address: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, {
    message: 'Address description cannot exceed 200 characters',
  })
  address_description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Google map link cannot exceed 200 characters' })
  @IsUrl({}, { message: 'Google map link must be a valid URL' })
  google_map_link?: string;
}
