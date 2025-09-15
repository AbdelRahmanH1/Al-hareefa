import { ApiProperty } from '@nestjs/swagger';
import { TeamResponseDto } from './Team-response.dto';
import { PaginationMetaDto } from 'src/shared/dto/PaginationMeta.dto';

export class PaginatedTeamsDto {
  @ApiProperty({ description: 'Array of teams', type: [TeamResponseDto] })
  items: TeamResponseDto[];

  @ApiProperty({
    description: 'Pagination meta info',
    type: () => PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}
