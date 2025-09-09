import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PlayerProfileDto } from './player.dto';
import { CoachProfileDto } from './coach.dto';
import { OrganizationProfileDto } from './organization.dto';
import { UserRole } from 'generated/prisma';

export class RegisterUserDto {
  @IsString()
  firebaseUid: string;

  @IsString()
  email: string;

  @IsString()
  fullName: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsDateString()
  birthDate: string;

  @ValidateNested()
  @Type(() => Object)
  profile: PlayerProfileDto | CoachProfileDto | OrganizationProfileDto;
}
