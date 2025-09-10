import {
  IsOptional,
  IsString,
  IsEmail,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ================= User Base Info =================
class UpdateUserDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDateString()
  birth_date?: string;
}

class UpdatePlayerProfileDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  guardianId?: number;

  @IsOptional()
  preferred_games?: string[];
}

class UpdateCoachProfileDto {
  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  specialization?: string;
}

class UpdateOrganizationProfileDto {
  @IsOptional()
  @IsString()
  organization_name?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateProfileDto {
  @ValidateNested()
  @Type(() => UpdateUserDto)
  user?: UpdateUserDto;

  @ValidateNested()
  @Type(() => UpdatePlayerProfileDto)
  playerProfile?: UpdatePlayerProfileDto;

  @ValidateNested()
  @Type(() => UpdateCoachProfileDto)
  coachProfile?: UpdateCoachProfileDto;

  @ValidateNested()
  @Type(() => UpdateOrganizationProfileDto)
  organizationProfile?: UpdateOrganizationProfileDto;
}
