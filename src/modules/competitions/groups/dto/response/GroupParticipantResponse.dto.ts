import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class GroupParticipantDto {
  @ApiProperty({ example: '101' })
  @Expose()
  @Transform(({ value }) =>
    value !== null && value !== undefined ? value.toString() : null,
  )
  id: string;

  @ApiProperty({ example: 'TEAM' })
  @Expose()
  type: 'TEAM' | 'PLAYER';

  @ApiProperty({ example: 'The Avengers' })
  @Expose()
  name: string;

  @ApiProperty({ example: 0 })
  @Expose()
  points: number;

  @ApiProperty({ example: 0 })
  @Expose()
  wins: number;

  @ApiProperty({ example: 0 })
  @Expose()
  losses: number;
}
