import { ApiProperty } from '@nestjs/swagger';
import { CompetitionResponseDto } from 'src/modules/competitions/dto/response/Competition-response.dto';
import { PaginationMetaDto } from 'src/shared/dto/PaginationMeta.dto';

export class PaginatedCompetitionResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Competitions fetched successfully' })
  message: string;

  @ApiProperty({
    type: () => ({
      items: { type: [CompetitionResponseDto] },
      meta: { type: PaginationMetaDto },
    }),
  })
  data: {
    items: CompetitionResponseDto[];
    meta: PaginationMetaDto;
  };
}

export class SingleCompetitionResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Competition updated successfully' })
  message: string;

  @ApiProperty({ type: CompetitionResponseDto })
  data: CompetitionResponseDto;
}
