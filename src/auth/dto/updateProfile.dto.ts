import {
  IsOptional,
  IsString,
  IsEmail,
  IsDateString,
  ValidateNested,
  Length,
  IsEnum,
  IsPhoneNumber,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { GameType, UserRole } from 'generated/prisma';

// ================= User Base Info =================
class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(3, 50, { message: 'full name must be between 3 and 50 characters' })
  full_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber('EG')
  phone?: any;

  @IsOptional()
  @IsString()
  gender?: UserRole;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  birth_date?: string;
}

class UpdatePlayerProfileDto {
  @IsOptional()
  guardianId?: number;

  @IsOptional()
  @IsEnum(GameType, { each: true })
  preferred_games?: GameType[];
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
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserDto)
  user?: UpdateUserDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePlayerProfileDto)
  playerProfile?: UpdatePlayerProfileDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateCoachProfileDto)
  coachProfile?: UpdateCoachProfileDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateOrganizationProfileDto)
  organizationProfile?: UpdateOrganizationProfileDto;
}
