import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TeamMemberDto {
  @ApiProperty({ description: 'Team member ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Full name of the team member' })
  @Expose()
  full_name: string;
}
