import { ApiProperty } from '@nestjs/swagger';
import { GameType } from '@prisma/client';
import { Expose } from 'class-transformer';

export class TeamInviteQRResponseDto {
  @Expose()
  @ApiProperty({ description: 'Invite token' })
  token: string;

  @Expose()
  @ApiProperty({ description: 'ID of the team' })
  teamId: bigint;

  @Expose()
  @ApiProperty({ description: 'Name of the team' })
  teamName: string;

  @Expose()
  @ApiProperty({ description: 'Game type of the team', enum: GameType })
  gameType: string;
}
