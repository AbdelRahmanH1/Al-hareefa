// ParticipantPlain.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class ParticipantPlainDto {
  @ApiProperty()
  @Expose()
  id: bigint;

  @ApiProperty({ example: 'PLAYER' })
  @Expose()
  type: 'TEAM' | 'PLAYER';

  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => obj.team?.name || obj.player?.user?.full_name)
  name: string;

  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => obj.team?.id || obj.player?.id)
  teamId?: bigint;

  @ApiProperty()
  @Expose()
  points: number;

  @ApiProperty()
  @Expose()
  wins: number;

  @ApiProperty()
  @Expose()
  losses: number;
}
