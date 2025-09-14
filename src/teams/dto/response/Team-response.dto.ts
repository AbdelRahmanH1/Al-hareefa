import { Expose } from 'class-transformer';
import { TeamMemberDto } from 'src/teams/memberships/dto/response/TeamMember.response';

export class TeamResponseDto {
  @Expose()
  id: string;
  @Expose()
  name: string;
  @Expose()
  logo?: string | null;
  @Expose()
  game: string;
  @Expose()
  created_by_id?: string;
  @Expose()
  created_by_role?: string;
  @Expose()
  created_at?: Date;
  @Expose()
  members?: TeamMemberDto[];
}
