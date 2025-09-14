import { Expose } from 'class-transformer';

export class TeamInviteResponseDto {
  @Expose()
  id: string;

  @Expose()
  team_id: string;

  @Expose()
  invited_id: string;

  @Expose()
  invited_role: string;

  @Expose()
  invited_email?: string | null;

  @Expose()
  invited_by_id: string;

  @Expose()
  status: string;

  @Expose()
  created_at: Date;
}
