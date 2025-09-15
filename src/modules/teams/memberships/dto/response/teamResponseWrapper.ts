import { ApiProperty } from '@nestjs/swagger';
import { TeamResponseDto } from 'src/modules/teams/dto/response/Team-response.dto';

export class TeamResponseWrapperDto {
  @ApiProperty({ description: 'Whether the request was successful' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'User data', type: () => TeamResponseDto })
  data: TeamResponseDto;
}
