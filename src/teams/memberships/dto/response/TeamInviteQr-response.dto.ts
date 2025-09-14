import { Expose } from 'class-transformer';

export class TeamInviteQRResponseDto {
  @Expose()
  token: string;

  @Expose()
  teamId: bigint;

  @Expose()
  teamName: string;

  @Expose()
  gameType: string;
}
