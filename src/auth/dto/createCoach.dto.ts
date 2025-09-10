import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCoachProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Bio must be at least 10 characters long' })
  @MaxLength(500, { message: 'Bio cannot exceed 500 characters' })
  bio?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Experience must have at least 2 characters' })
  @MaxLength(100, { message: 'Experience cannot exceed 100 characters' })
  experience?: string;
}
