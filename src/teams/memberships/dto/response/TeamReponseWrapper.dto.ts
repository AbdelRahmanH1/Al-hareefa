import { ApiProperty } from '@nestjs/swagger';
import { TeamInviteResponseDto } from './TeamInvite-response.dto';

export class TeamMemberWrapper {
  @ApiProperty({ description: 'Whether the request was successful' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'User data', type: () => TeamInviteResponseDto })
  data: TeamInviteResponseDto;
}
