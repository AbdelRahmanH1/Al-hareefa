import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CoachProfileResponseDto {
  @ApiProperty()
  @Expose()
  id: string;
  @ApiProperty()
  @Expose()
  user_id: string;
  @ApiProperty()
  @Expose()
  bio?: string;
  @ApiProperty()
  @Expose()
  experience?: string;
}
