import { IsOptional, IsString } from 'class-validator';

export class CoachProfileDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  experience?: string;
}
