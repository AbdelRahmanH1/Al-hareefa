import { GameType } from '@prisma/client';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CompetitionTypeResponseDto {
  @ApiProperty({ example: 1, description: 'Unique ID of the competition type' })
  @Expose()
  id: bigint;

  @ApiProperty({
    example: 'Champions League',
    description: 'Name of the competition',
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: 'Each team must have at least 5 players',
    description: 'Competition rules',
  })
  @Expose()
  rules: string;

  @ApiProperty({
    enum: GameType,
    description: 'Sport associated with this competition',
  })
  @Expose()
  sport: GameType;

  @ApiProperty({
    example: 5,
    description: 'Minimum number of players per team',
  })
  @Expose()
  min_player_per_team: number;

  @ApiProperty({
    example: 11,
    description: 'Maximum number of players per team',
  })
  @Expose()
  max_player_per_team: number;

  @ApiProperty({
    example: '2025-10-01T12:00:00.000Z',
    description: 'Creation date',
  })
  @Expose()
  created_at: Date;
}
