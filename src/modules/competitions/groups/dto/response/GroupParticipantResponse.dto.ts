import { ApiProperty } from '@nestjs/swagger';

export class GroupParticipantDto {
  @ApiProperty({ example: 101 })
  id: bigint;

  @ApiProperty({ example: 'TEAM' })
  type: 'TEAM' | 'PLAYER';

  @ApiProperty({ example: 'The Avengers' })
  name: string;

  @ApiProperty({ example: 0 })
  points: number;

  @ApiProperty({ example: 0 })
  wins: number;

  @ApiProperty({ example: 0 })
  losses: number;
}
