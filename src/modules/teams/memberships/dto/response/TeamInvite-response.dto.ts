import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TeamInviteResponseDto {
  @ApiProperty({ description: 'Invite ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'ID of the team' })
  @Expose()
  team_id: string;

  @ApiProperty({ description: 'ID of the invited user' })
  @Expose()
  invited_id: string;

  @ApiProperty({ description: 'Role of the invited user' })
  @Expose()
  invited_role: string;

  @ApiProperty({
    description: 'Email of the invited user',
    required: false,
    nullable: true,
  })
  @Expose()
  invited_email?: string | null;

  @ApiProperty({ description: 'ID of the user who sent the invite' })
  @Expose()
  invited_by_id: string;

  @ApiProperty({
    description: 'Status of the invite (pending, accepted, rejected)',
  })
  @Expose()
  status: string;

  @ApiProperty({
    description: 'Date when the invite was created',
    type: String,
    format: 'date-time',
  })
  @Expose()
  created_at: Date;
}
