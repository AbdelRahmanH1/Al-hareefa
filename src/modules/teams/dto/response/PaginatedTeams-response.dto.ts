import { Expose, Type } from 'class-transformer';
import { TeamResponseDto } from './Team-response.dto';

export class PaginatedTeamsResponseDto {
  @Expose()
  @Type(() => TeamResponseDto)
  items: TeamResponseDto[];

  @Expose()
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
