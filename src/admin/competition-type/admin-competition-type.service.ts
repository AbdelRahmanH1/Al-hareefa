import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCompetitionType } from './dto/CreateCompetition-type.dto';
import { UpdateCompetitionType } from './dto/UpdateCompetiton-type.dto';
import { plainToInstance } from 'class-transformer';
import { CompetitionTypeResponseDto } from './dto/competition-type-response.dto';
import { ResponseDto } from 'src/shared/dto/response.dto';

@Injectable()
export class CompetitionTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async createGame(
    userId: bigint,
    request: CreateCompetitionType,
  ): Promise<ResponseDto<CompetitionTypeResponseDto>> {
    const gameExists = await this.prisma.competitionType.findFirst({
      where: { name: request.name },
    });

    if (gameExists)
      throw new BadRequestException('This game name already exists');

    if (request.max_player_per_team < request.min_player_per_team) {
      throw new BadRequestException(
        'Maximum players must be greater than or equal to minimum players',
      );
    }

    const data = { ...request, createdByAdmin: userId };
    const created = await this.prisma.competitionType.create({ data });

    return {
      success: true,
      message: 'Competition type added successfully',
      data: plainToInstance(CompetitionTypeResponseDto, created),
    };
  }

  async deleteGame(gameId: bigint): Promise<ResponseDto<any>> {
    const gameExists = await this.prisma.competitionType.findUnique({
      where: { id: gameId },
    });
    if (!gameExists) throw new NotFoundException('Competition type not found');

    const ongoingCompetitions = await this.prisma.competition.findMany({
      where: {
        typeId: gameId,
        end_date: { gt: new Date() },
      },
      select: { id: true },
    });

    if (ongoingCompetitions.length > 0) {
      throw new BadRequestException(
        'Cannot delete this game type because there are competitions that have not finished yet',
      );
    }

    await this.prisma.competitionType.delete({ where: { id: gameId } });

    return {
      success: true,
      message: 'Competition type deleted successfully',
      data: null,
    };
  }

  async updateGame(
    gameId: bigint,
    dto: UpdateCompetitionType,
  ): Promise<ResponseDto<CompetitionTypeResponseDto>> {
    const gameExists = await this.prisma.competitionType.findUnique({
      where: { id: gameId },
    });
    if (!gameExists) throw new NotFoundException('Competition type not found');

    if (dto.min_player_per_team && dto.max_player_per_team) {
      if (dto.max_player_per_team < dto.min_player_per_team) {
        throw new BadRequestException(
          'Maximum players must be >= minimum players',
        );
      }
    }

    const comptition_type = await this.prisma.competitionType.update({
      where: { id: gameId },
      data: { ...dto },
    });

    return {
      success: true,
      message: 'Competition type updated successfully',
      data: plainToInstance(CompetitionTypeResponseDto, comptition_type),
    };
  }
}
