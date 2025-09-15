import { ApiProperty } from '@nestjs/swagger';
import { PaginatedTeamsDto } from './PaginatedTeams.dto';

export class PaginatedTeamsResponseDto {
  @ApiProperty({ description: 'Whether the request was successful' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({
    description: 'Paginated teams data',
    type: () => PaginatedTeamsDto,
  })
  data: PaginatedTeamsDto;
}
