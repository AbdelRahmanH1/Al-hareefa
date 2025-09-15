import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PlayerProfileResponseDto {
  @ApiProperty()
  @Expose()
  id: string;
  @ApiProperty()
  @Expose()
  userId: string;
  @ApiProperty()
  @Expose()
  preferred_games: string[];
}
