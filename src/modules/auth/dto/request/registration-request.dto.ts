import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsString,
  IsPhoneNumber,
  ValidateNested,
  IsEmail,
  Length,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

import { UserRole, Gender } from '@prisma/client';
import { CreatePlayerProfileRequestDto } from './CreatePlayer-request.dto';
import { CreateCoachProfileRequestDto } from './createCoach-request.dto';
import { CreateOrganizationProfileRequestDto } from './CreateOrganization-request.dto';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firebase_token: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firebase_id: string;

  @ApiProperty()
  @IsString()
  full_name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty()
  @IsPhoneNumber('EG')
  phone: string;

  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty()
  @IsString()
  @Length(2, 50)
  city: string;
  @ApiProperty()
  @ApiProperty()
  @IsDateString()
  birthDate: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  photo_url: string;
  @ApiProperty({ type: Object })
  @ValidateNested()
  @Type((obj) => {
    switch (obj?.object?.role) {
      case UserRole.PLAYER:
        return CreatePlayerProfileRequestDto;
      case UserRole.COACH:
        return CreateCoachProfileRequestDto;
      case UserRole.ORGANIZATION:
        return CreateOrganizationProfileRequestDto;
      default:
        return Object;
    }
  })
  profile:
    | CreatePlayerProfileRequestDto
    | CreateCoachProfileRequestDto
    | CreateOrganizationProfileRequestDto;
}
