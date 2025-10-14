import { ApiProperty } from '@nestjs/swagger';
import { Gender, UserRole } from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';

export class CreateAdminRequest {
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
  @IsDateString()
  birthDate: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  photo_url: string;
}
