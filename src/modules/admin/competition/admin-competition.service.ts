import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApprovalStatus } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompetitionResponseAdminDto } from './dto/response/Competition-response.dto';
import { UpdateCompetitionStatusDto } from './dto/request/UpdateCompeitionStatus.dto';
import { ResponseDto } from 'src/shared/dto/response.dto';

@Injectable()
export class CompetitionService {
  constructor(private readonly prisma: PrismaService) {}

  async getCompetitionsByStatus(
    status?: string,
    page = 1,
    limit = 10,
  ): Promise<ResponseDto<CompetitionResponseAdminDto[]>> {
    const skip = (page - 1) * limit;
    const normalizedStatus =
      status &&
      Object.values(ApprovalStatus).includes(
        status.toUpperCase() as ApprovalStatus,
      )
        ? (status.toUpperCase() as ApprovalStatus)
        : ApprovalStatus.PENDING;

    const competitions = await this.prisma.competition.findMany({
      where: { approval_status: normalizedStatus },
      include: {
        organization: {
          select: { user: { select: { full_name: true, id: true } } },
        },
      },
      skip,
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
    });

    const dto = plainToInstance(
      CompetitionResponseAdminDto,
      competitions.map((comp) => ({
        ...comp,
        organization_name: comp.organization.user.full_name,
      })),
      { excludeExtraneousValues: true },
    );

    return {
      success: true,
      message: `Competitions fetched successfully`,
      data: dto,
    };
  }

  async updateCompetitionStatus(
    id: bigint,
    body: UpdateCompetitionStatusDto,
  ): Promise<ResponseDto<CompetitionResponseAdminDto>> {
    const competitions = await this.prisma.competition.findFirst({
      where: { id, approval_status: ApprovalStatus.PENDING },
      include: {
        organization: {
          select: { user: { select: { full_name: true, id: true } } },
        },
      },
    });

    if (!competitions) {
      throw new NotFoundException('Competition not found');
    }
    const now = new Date();
    const startDate = new Date(competitions.start_date);

    if (body.status === ApprovalStatus.ACCEPTED) {
      const minAcceptTime = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);

      if (now > minAcceptTime) {
        throw new BadRequestException(
          'Competition must be accepted at least 24 hours before the start date',
        );
      }
    }
    const updatedCom = await this.prisma.competition.update({
      where: { id },
      data: { approval_status: body.status },
      include: {
        organization: {
          select: { user: { select: { full_name: true, id: true } } },
        },
      },
    });
    const dto = plainToInstance(
      CompetitionResponseAdminDto,
      {
        ...updatedCom,
        organization_name: updatedCom.organization.user.full_name,
      },
      { excludeExtraneousValues: true },
    );

    return {
      success: true,
      message: `Organization status updated to ${updatedCom.approval_status}`,
      data: dto,
    };
  }
}
