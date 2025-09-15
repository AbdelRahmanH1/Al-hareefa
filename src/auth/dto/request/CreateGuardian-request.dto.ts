import {
  IsString,
  IsEnum,
  MinLength,
  MaxLength,
  IsPhoneNumber,
} from 'class-validator';
import { Relation } from '@prisma/client';

export class CreateGuardianRequestDto {
  @IsString()
  @MinLength(3, { message: 'Full name must be at least 3 character long' })
  @MaxLength(30, { message: 'Full name must be exceed 30 character' })
  fullName: string;

  @IsString()
  email: string;

  @IsPhoneNumber('EG', { message: 'Phone must be valid' })
  phone: string;

  @IsEnum(Relation, { message: 'Realtion must be FATHER,MOTHER,OTHER' })
  relation: Relation;
}
