import { IsString, IsEnum } from 'class-validator';
import { Relation } from '@prisma/client';

export class GuardianDto {
  @IsString()
  fullName: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsEnum(Relation)
  relation: Relation;
}
