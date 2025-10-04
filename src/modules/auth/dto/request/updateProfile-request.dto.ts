import {
  IsOptional,
  IsString,
  IsEmail,
  ValidateNested,
  Length,
  IsEnum,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { GameType, OrganizationType, UserRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

// ================= User Base Info =================
class UpdateUserDto {
  @ApiProperty({
    description: 'Full name',
    required: false,
    minLength: 3,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(3, 50, { message: 'full name must be between 3 and 50 characters' })
  full_name?: string;

  @ApiProperty({ description: 'Email address', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsPhoneNumber('EG')
  phone?: any;

  @ApiProperty({ description: 'Gender', required: false })
  @IsOptional()
  gender?: string;

  @ApiProperty({ description: 'City', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'Photo URL', required: false })
  @IsOptional()
  @IsUrl({}, { message: 'Photo URL must be a valid URL' })
  photo_url?: string;

  @ApiProperty({
    description: 'Birth date',
    required: false,
    type: String,
    format: 'date',
  })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  birth_date?: string;
}

class UpdatePlayerProfileRequestDto {
  @ApiProperty({ description: 'Guardian ID', required: false })
  @IsOptional()
  guardianId?: number;

  @ApiProperty({
    description: 'Preferred games',
    required: false,
    enum: GameType,
    isArray: true,
  })
  @IsOptional()
  @IsEnum(GameType, { each: true })
  preferred_games?: GameType[];
}

class UpdateCoachProfileRequestDto {
  @ApiProperty({
    description: 'Experience description',
    required: false,
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Experience must have at least 2 characters' })
  @MaxLength(100, { message: 'Experience cannot exceed 100 characters' })
  experience?: string;

  @ApiProperty({
    description: 'Short bio',
    required: false,
    minLength: 10,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Bio must be at least 10 characters long' })
  @MaxLength(500, { message: 'Bio cannot exceed 500 characters' })
  bio?: string;
}

class UpdateOrganizationProfileRequestDto {
  @ApiProperty({
    description: 'Organization name',
    required: false,
    minLength: 3,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Organization name must be at least 3 characters' })
  @MaxLength(50, { message: 'Organization name cannot exceed 50 characters' })
  owner_name?: string;

  @ApiProperty({
    description: 'Organization type',
    required: false,
    enum: OrganizationType,
  })
  @IsOptional()
  @IsEnum(OrganizationType, { message: 'Invalid organization type' })
  type?: OrganizationType;

  @ApiProperty({
    description: 'District',
    required: false,
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'District must be at least 2 characters' })
  @MaxLength(50, { message: 'District cannot exceed 50 characters' })
  district?: string;

  @ApiProperty({
    description: 'Street address',
    required: false,
    minLength: 3,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Street address must be at least 3 characters' })
  @MaxLength(100, { message: 'Street address cannot exceed 100 characters' })
  street_address?: string;

  @ApiProperty({
    description: 'Address description',
    required: false,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, {
    message: 'Address description cannot exceed 200 characters',
  })
  address_description?: string;

  @ApiProperty({
    description: 'Google map link',
    required: false,
    maxLength: 200,
    format: 'url',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Google map link cannot exceed 200 characters' })
  @IsUrl({}, { message: 'Google map link must be a valid URL' })
  google_map_link?: string;
}

export class UpdateProfileDto {
  @ApiProperty({
    description: 'User basic info',
    required: false,
    type: UpdateUserDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserDto)
  user?: UpdateUserDto;

  @ApiProperty({
    description: 'Player profile info',
    required: false,
    type: UpdatePlayerProfileRequestDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePlayerProfileRequestDto)
  playerProfile?: UpdatePlayerProfileRequestDto;

  @ApiProperty({
    description: 'Coach profile info',
    required: false,
    type: UpdateCoachProfileRequestDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateCoachProfileRequestDto)
  coachProfile?: UpdateCoachProfileRequestDto;

  @ApiProperty({
    description: 'Organization profile info',
    required: false,
    type: UpdateOrganizationProfileRequestDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateOrganizationProfileRequestDto)
  organizationProfile?: UpdateOrganizationProfileRequestDto;
}
