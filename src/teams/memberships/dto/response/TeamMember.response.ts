import { Expose } from 'class-transformer';

export class TeamMemberDto {
  @Expose()
  id: string;

  @Expose()
  full_name: string;
}
