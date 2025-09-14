import { Expose, Type } from 'class-transformer';
import { OrganizationResponseDto } from './OrganizationResponsedto';

export class PaginatedOrganizationsResponseDto {
  @Expose()
  @Type(() => OrganizationResponseDto)
  items: OrganizationResponseDto[];

  @Expose()
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
