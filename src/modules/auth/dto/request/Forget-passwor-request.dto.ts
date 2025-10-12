import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ForgetPassowrdRequest {
  @ApiProperty({ required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
