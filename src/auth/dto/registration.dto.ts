import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsString,
  IsPhoneNumber,
  ValidateNested,
  IsEmail,
  IsEmpty,
  Length,
} from 'class-validator';
import { CreatePlayerProfileDto } from './CreatePlayer.dto';
import { CreateCoachProfileDto } from './createCoach.dto';
import { CreateOrganizationProfileDto } from './CreateOrganization.dto';
import { UserRole, Gender } from '@prisma/client';

export class RegisterUserDto {
  @IsString()
  firebaseUid: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(3, 50)
  fullName: string;

  @IsPhoneNumber('EG')
  phone: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  @Length(5, 20)
  city: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsDateString()
  birthDate: string;

  @ValidateNested()
  @Type(() => Object)
  profile:
    | CreatePlayerProfileDto
    | CreateCoachProfileDto
    | CreateOrganizationProfileDto;
}
