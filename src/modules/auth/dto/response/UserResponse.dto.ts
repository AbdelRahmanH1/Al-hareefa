import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { PlayerProfileResponseDto } from './PlayerProfile-response.dto';
import { CoachProfileResponseDto } from './CoachProfile-response.dto';
import { OrganizationProfileResponseDto } from './OrganizationProfile-response.dto';
import { AdminProfileResponseDto } from './AdminProfile-response.dto';

export class UserResponseDto {
  @ApiProperty({ description: 'User ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Full name of the user' })
  @Expose()
  full_name: string;

  @ApiProperty({ description: 'Email address' })
  @Expose()
  email: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @Expose()
  phone?: string;

  @ApiProperty({ description: 'Gender', required: false })
  @Expose()
  gender?: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
  @Expose()
  role: UserRole;

  @ApiProperty({ description: 'Birth date', required: false })
  @Expose()
  birth_date?: string;

  @ApiProperty({ description: 'City', required: false })
  @Expose()
  city?: string;

  @ApiProperty({ type: PlayerProfileResponseDto, required: false })
  @Expose()
  @Type(() => PlayerProfileResponseDto)
  @Transform(({ value }) => value || undefined)
  playerProfile?: PlayerProfileResponseDto;

  @ApiProperty({ type: CoachProfileResponseDto, required: false })
  @Expose()
  @Type(() => CoachProfileResponseDto)
  @Transform(({ value }) => value || undefined)
  coachProfile?: CoachProfileResponseDto;

  @ApiProperty({ type: OrganizationProfileResponseDto, required: false })
  @Expose()
  @Type(() => OrganizationProfileResponseDto)
  @Transform(({ value }) => value || undefined)
  organizationProfile?: OrganizationProfileResponseDto;

  @ApiProperty({ type: AdminProfileResponseDto, required: false })
  @Expose()
  @Type(() => AdminProfileResponseDto)
  @Transform(({ value }) => value || undefined)
  adminProfile?: AdminProfileResponseDto;
}
