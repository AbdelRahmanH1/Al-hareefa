import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TeamMemberDto } from '../../memberships/dto/response/TeamMember.response';

export class TeamResponseDto {
  @ApiProperty({ description: 'Team ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Team name' })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Team logo URL',
    required: false,
    nullable: true,
  })
  @Expose()
  logo?: string | null;

  @ApiProperty({ description: 'Game type' })
  @Expose()
  game: string;

  @ApiProperty({
    description: 'ID of the user who created the team',
    required: false,
  })
  @Expose()
  created_by_id?: string;

  @ApiProperty({
    description: 'Role of the user who created the team',
    required: false,
  })
  @Expose()
  created_by_role?: string;

  @ApiProperty({
    description: 'Date when the team was created',
    required: false,
    type: String,
    format: 'date-time',
  })
  @Expose()
  created_at?: Date;

  @ApiProperty({
    description: 'List of team members',
    required: false,
    type: () => [TeamMemberDto],
  })
  @Expose()
  @Type(() => TeamMemberDto)
  members?: TeamMemberDto[];
}
