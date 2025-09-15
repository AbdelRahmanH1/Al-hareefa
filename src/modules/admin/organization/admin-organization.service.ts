import { Injectable, NotFoundException } from '@nestjs/common';
import { ApprovalStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateOrganizationStatusDto } from './dto/UpdateOrganizationStatus.dto';
import { plainToInstance } from 'class-transformer';
import { OrganizationResponseDto } from './dto/OrganizationResponsedto';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { PaginatedOrganizationsResponseDto } from './dto/PaginatedOrganizations-esponse.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrganizationsByStatus(
    status?: string,
    page = 1,
    limit = 10,
  ): Promise<ResponseDto<PaginatedOrganizationsResponseDto>> {
    const skip = (page - 1) * limit;

    const normalizedStatus =
      status &&
      Object.values(ApprovalStatus).includes(
        status.toUpperCase() as ApprovalStatus,
      )
        ? (status.toUpperCase() as ApprovalStatus)
        : ApprovalStatus.PENDING;

    const [organizations, total] = await this.prisma.$transaction([
      this.prisma.organizationProfile.findMany({
        where: { approval_status: normalizedStatus },
        include: { user: { select: { full_name: true, id: true } } },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.organizationProfile.count({
        where: { approval_status: normalizedStatus },
      }),
    ]);
    const items = plainToInstance(
      OrganizationResponseDto,
      organizations.map((org) => ({
        ...org,
        owner_name: org.user.full_name,
        user: undefined,
      })),
      { excludeExtraneousValues: true },
    );

    const paginatedResponse: PaginatedOrganizationsResponseDto = {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    return {
      success: true,
      message: `Organizations fetched successfully`,
      data: paginatedResponse,
    };
  }

  async updateOrganizationStatus(
    id: bigint,
    body: UpdateOrganizationStatusDto,
  ): Promise<ResponseDto<OrganizationResponseDto>> {
    const organization = await this.prisma.organizationProfile.findFirst({
      where: { id, approval_status: ApprovalStatus.PENDING },
    });

    if (!organization) {
      throw new NotFoundException('Orgnization not found');
    }

    const updatedOrg = await this.prisma.organizationProfile.update({
      where: { id },
      data: { approval_status: body.status },
      include: { user: { select: { full_name: true, id: true } } },
    });
    const dto = plainToInstance(
      OrganizationResponseDto,
      {
        ...updatedOrg,
        owner_name: updatedOrg.user.full_name,
        user: undefined,
      },
      { excludeExtraneousValues: true },
    );
    return {
      success: true,
      message: `Organization status updated to ${updatedOrg.approval_status}`,
      data: dto,
    };
  }
}
