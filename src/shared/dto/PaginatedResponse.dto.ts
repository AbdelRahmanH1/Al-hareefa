import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class PaginatedResponseDto<T> {
  @ApiProperty({ type: [Object], description: 'List of items' })
  @Expose()
  @Type(() => Object)
  items: T[];

  @ApiProperty({
    description: 'Pagination info',
    example: { page: 1, limit: 10, total: 50, totalPages: 5 },
  })
  @Expose()
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
