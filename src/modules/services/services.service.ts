import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClassServiceRequestDto } from './dto/request/CreateServiceRequest.dto';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { UpdateServiceRequestDto } from './dto/request/UpdateServiceRequest.dto';
import { SearchServiceRequestDto } from './dto/request/SearchServiceRequestDto';
import { PaginatedResponseDto } from './dto/response/PaginatedResponse.dto';
import { ServiceResponseDto } from './dto/response/ServiceResponse.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async createService(
    userId: bigint,
    data: ClassServiceRequestDto,
  ): Promise<ResponseDto<null>> {
    await this.prisma.coachService.create({
      data: {
        ...data,
        coach_id: userId,
      },
    });
    return {
      success: true,
      message: 'service created successfully',
      data: null,
    };
  }

  async updateService(
    userId: bigint,
    serviceId: bigint,
    data: UpdateServiceRequestDto,
  ): Promise<ResponseDto<null>> {
    const service = await this.prisma.coachService.findFirst({
      where: { coach_id: userId, id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value != undefined),
    );
    if (Object.keys(updateData).length == 0) {
      throw new BadRequestException('No fields to update');
    }
    await this.prisma.coachService.update({
      where: { id: serviceId },
      data: {
        ...data,
      },
    });
    return {
      success: true,
      message: 'Service updated successfully',
      data: null,
    };
  }

  async deleteService(
    userId: bigint,
    serviceId: bigint,
  ): Promise<ResponseDto<null>> {
    const service = await this.prisma.coachService.findUnique({
      where: { id: serviceId },
    });
    if (!service) throw new NotFoundException('Service not found');
    if (service.coach_id !== userId)
      throw new ForbiddenException(
        'You are not allowed to delete this service',
      );
    await this.prisma.coachService.delete({ where: { id: serviceId } });
    return {
      success: true,
      message: 'Service deleted successfully',
      data: null,
    };
  }

  async getMyServices(
    userId: bigint,
  ): Promise<ResponseDto<ServiceResponseDto[]>> {
    const results = await this.prisma.coachService.findMany({
      where: { coach_id: userId },
      orderBy: { created_at: 'desc' },
    });

    const items = plainToInstance(ServiceResponseDto, results, {
      excludeExtraneousValues: true,
    });

    return {
      success: true,
      message: 'Your services fetched successfully',
      data: items,
    };
  }

  async searchServices(
    query: SearchServiceRequestDto,
  ): Promise<ResponseDto<PaginatedResponseDto<ServiceResponseDto>>> {
    const { page = 1, limit = 10, title, minPrice, maxPrice } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      title: title ? { contains: title, mode: 'insensitive' } : undefined,
      price:
        minPrice !== undefined || maxPrice !== undefined
          ? { gte: minPrice ?? undefined, lte: maxPrice ?? undefined }
          : undefined,
    };

    const [services, total] = await this.prisma.$transaction([
      this.prisma.coachService.findMany({
        where,
        skip,
        include: {
          coach: { include: { user: { select: { full_name: true } } } },
        },
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.coachService.count({ where }),
    ]);

    const items = plainToInstance(
      ServiceResponseDto,
      services.map((s) => ({
        ...s,
        coach: {
          id: s.coach_id,
          name: s.coach.user.full_name,
        },
      })),
      {
        excludeExtraneousValues: true,
      },
    );

    return {
      success: true,
      message: 'Services fetched successfully',
      data: {
        total,
        page,
        limit,
        items,
      },
    };
  }
}
