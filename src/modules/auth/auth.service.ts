import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { GameType, Gender, OrganizationType, UserRole } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { RedisJwtService } from 'src/redis/redis-jwt.service';
import { jwtConfig } from 'src/config/JwtConfig';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { UpdateProfileDto } from './dto/request/updateProfile-request.dto';
import { UserResponseDto } from './dto/response/UserResponse.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisJwtService,
  ) {}

  async registerDummy() {
    const user = await this.prisma.user.create({
      data: {
        firebase_id: 'fake_firebase_uid_2920',
        full_name: 'Org1',
        email: 'admin1@example.com',
        phone: '0223212129',
        role: UserRole.ADMIN,
        gender: Gender.MALE,
        city: 'Alexandria',
        birth_date: new Date('2020-01-01'),
      },
    });

    /* const playerProfile = await this.prisma.playerProfile.create({
      data: {
        preferred_games: { set: [GameType.FOOTBALL] },
        id: user.id,
        userId: user.id,
      },
    }); */

    /* const adminProfile = await this.prisma.adminProfile.create({
      data: { user_id: user.id, id: user.id },
    }); */

    /*    const OrganizationProfile = await this.prisma.organizationProfile.create({
      data: {
        owner_name: 'Ahmed',
        id: user.id,
        user_id: user.id,
        type: OrganizationType.CLUB,
        district: 'nothing',
        street_address: 'nothing',
      },
    }); */

    const coachProfile = await this.prisma.coachProfile.create({
      data: { id: user.id, user_id: user.id },
    });
    return user;
  }
  async loginDummy() {
    const user = await this.prisma.user.findUnique({
      where: { email: 'org1@example.com' },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const token = this.jwtService.sign(
      { userId: user.id, firebaseId: user.firebase_id, role: user.role },
      { secret: jwtConfig.SECRET_KEY },
    );

    await this.redisService.saveToken(String(user.id), token);

    return { message: 'User created successfully', token };
  }

  async getProfile(userId: bigint): Promise<ResponseDto<UserResponseDto>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        playerProfile: true,
        organizationProfile: true,
        coachProfile: true,
        adminProfile: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const response = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
    return { success: true, message: 'User found succesfully', data: response };
  }

  async updateProfile(
    userId: bigint,
    role: string,
    request: UpdateProfileDto,
  ): Promise<ResponseDto<UserResponseDto>> {
    const { playerProfile, coachProfile, organizationProfile, user } = request;
    const userData = user ? { ...user } : {};

    let profileUpdate: any = {};

    switch (role) {
      case 'PLAYER':
        if (playerProfile) {
          profileUpdate = { playerProfile: { update: playerProfile } };
        }
        break;

      case 'COACH':
        if (coachProfile) {
          profileUpdate = { coachProfile: { update: coachProfile } };
        }
        break;

      case 'ORGANIZATION':
        if (organizationProfile) {
          profileUpdate = {
            organizationProfile: { update: organizationProfile },
          };
        }
        break;

      case 'ADMIN':
        break;

      default:
        throw new BadRequestException('Invalid role');
    }

    const updateUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...userData,
        ...profileUpdate,
      },
      include: {
        playerProfile: true,
        coachProfile: true,
        organizationProfile: true,
        adminProfile: true,
      },
    });
    const response = plainToInstance(UserResponseDto, updateUser, {
      excludeExtraneousValues: true,
    });
    return {
      success: true,
      message: 'Profile updated successfully',
      data: response,
    };
  }
}
