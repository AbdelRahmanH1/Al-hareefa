import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class UpdateServiceRequestDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Length(3, 100)
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  description: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Max(500)
  duration: number;
}
