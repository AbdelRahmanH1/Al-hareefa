import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AdminProfileResponseDto {
  @ApiProperty()
  @Expose()
  id: string;
  @ApiProperty()
  @Expose()
  user_id: string;
}
