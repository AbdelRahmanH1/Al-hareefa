import { Transform, Type } from 'class-transformer';
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

import { UserRole, Gender } from '@prisma/client';
import { CreatePlayerProfileRequestDto } from './CreatePlayer-request.dto';
import { CreateCoachProfileRequestDto } from './createCoach-request.dto';
import { CreateOrganizationProfileRequestDto } from './CreateOrganization-request.dto';

export class RegisterUserRequestDto {
  @IsString()
  firebase_id: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(3, 50)
  full_name: string;

  @IsPhoneNumber('EG')
  phone: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  @Length(5, 20)
  city: string;

  @IsEnum(UserRole, { each: true })
  role: UserRole;

  @IsDateString()
  @Transform(({ value }) => new Date(value))
  birthDate: string;

  @ValidateNested()
  @Type(() => Object)
  profile:
    | CreatePlayerProfileRequestDto
    | CreateCoachProfileRequestDto
    | CreateOrganizationProfileRequestDto;
}
