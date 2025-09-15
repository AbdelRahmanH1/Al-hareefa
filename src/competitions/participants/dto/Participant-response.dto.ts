import { Expose } from 'class-transformer';

export class ParticipantResponseDto {
  @Expose()
  id: bigint;

  @Expose()
  competition_id: bigint;

  @Expose()
  competition_name: string;

  @Expose()
  player_id?: bigint;

  @Expose()
  team_id?: bigint;

  @Expose()
  status: 'PENDING' | 'ACCEPTED';

  @Expose()
  registered_at: Date;

  @Expose()
  payment_required?: number;

  @Expose()
  pay_link?: string;
}
