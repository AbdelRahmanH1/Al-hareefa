import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GameType, UserRole } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { UpdateProfileDto } from './dto/request/updateProfile-request.dto';
import { UserResponseDto } from './dto/response/UserResponse.dto';
import { RegisterUserRequestDto } from './dto/request/registration-request.dto';
import { CreatePlayerProfileRequestDto } from './dto/request/CreatePlayer-request.dto';
import { CreateCoachProfileRequestDto } from './dto/request/createCoach-request.dto';
import { CreateOrganizationProfileRequestDto } from './dto/request/CreateOrganization-request.dto';
import { FirebaseService } from './firebase/firebase.service';
import { PrismaClient } from '@prisma/client/extension';
import { ForgetPassowrdRequest } from './dto/request/Forget-passwor-request.dto';
import { generateWhatsAppLink } from 'src/shared/helpers/whatsapp.helper.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async firebase3(data: RegisterUserRequestDto) {
    let user = await this.prisma.user.findUnique({
      where: { firebase_id: data.firebase_id },
      include: {
        playerProfile: true,
        coachProfile: true,
        organizationProfile: true,
        adminProfile: true,
      },
    });

    if (user) {
      const profileMap = {
        PLAYER: user.playerProfile,
        COACH: user.coachProfile,
        ORGANIZATION: user.organizationProfile,
        ADMIN: user.adminProfile,
      };
      const profileExists = profileMap[user.role];

      if (!profileExists) {
        throw new BadRequestException('Profile not completed yet');
      }

      const newToken = await this.firebaseService.createCustomToken(
        user.firebase_id,
        user.id,
        user.role,
      );

      return {
        uid: user.firebase_id,
        email: user.email,
        role: user.role,
        firebase_token: newToken,
        message: 'User logged in successfully',
      };
    }

    if (!data.profile) {
      throw new BadRequestException('Profile data is required for this role');
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ phone: data.phone }, { email: data.email }] },
    });
    if (existingUser) {
      if (existingUser.phone === data.phone) {
        throw new BadRequestException('Phone number already in use');
      }
      if (existingUser.email === data.email) {
        throw new BadRequestException('Email already in use');
      }
    }

    const newUser = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          birth_date: new Date(data.birthDate),
          firebase_id: data.firebase_id,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          city: data.city,
          gender: data.gender,
          photo_url: data.photo_url || null,
        },
      });

      switch (data.role) {
        case UserRole.PLAYER:
          await this.createPlayerProfile(
            createdUser.id,
            data.birthDate,
            data.profile as CreatePlayerProfileRequestDto,
            tx,
          );
          break;
        case UserRole.COACH:
          await this.createCoachProfile(
            createdUser.id,
            data.profile as CreateCoachProfileRequestDto,
            tx,
          );
          break;
        case UserRole.ORGANIZATION:
          await this.createOrganizationProfile(
            createdUser.id,
            data.profile as CreateOrganizationProfileRequestDto,
            tx,
          );
          break;
      }

      return createdUser;
    });

    await this.firebaseService.setCustomClaims(
      data.firebase_id,
      newUser.id,
      newUser.role,
    );

    const newToken = await this.firebaseService.createCustomToken(
      newUser.firebase_id,
      newUser.id,
      newUser.role,
    );

    return {
      success: true,
      message: 'User registered successfully',
      data: {
        token: newToken,
      },
    };
  }

  private async createPlayerProfile(
    userId: bigint,
    birthDate: string,
    dto: CreatePlayerProfileRequestDto,
    tx: PrismaClient,
  ) {
    const age =
      (new Date().getTime() - new Date(birthDate).getTime()) /
      (1000 * 60 * 60 * 24 * 365);

    let guardianId: bigint | null = null;

    if (age < 18) {
      if (!dto.guardian) {
        throw new BadRequestException(
          'Guardian information is required for players under 18',
        );
      }

      const guardian = await tx.guardian.create({
        data: {
          full_name: dto.guardian.full_name,
          email: dto.guardian.email,
          phone: dto.guardian.phone,
          relation: dto.guardian.relation,
        },
      });

      guardianId = guardian.id;
    }

    const playerProfile = await tx.playerProfile.create({
      data: {
        id: userId,
        userId,
        preferred_games: { set: dto.preferred_games as GameType[] },
        guardianId,
      },
    });

    return playerProfile;
  }

  private async createOrganizationProfile(
    userId: bigint,
    dto: CreateOrganizationProfileRequestDto,
    tx: PrismaClient,
  ) {
    return await tx.organizationProfile.create({
      data: {
        id: userId,
        user_id: userId,
        ...dto,
        approval_status: 'PENDING',
      },
    });
  }

  private async createCoachProfile(
    userId: bigint,
    dto: CreateCoachProfileRequestDto,
    tx: PrismaClient,
  ) {
    return await tx.coachProfile.create({
      data: { id: userId, user_id: userId, ...dto },
    });
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

  async forgetPassowrd(
    data: ForgetPassowrdRequest,
  ): Promise<ResponseDto<string>> {
    const { email } = data;
    const userInDb = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!userInDb) throw new BadRequestException('Email not found in db');
    let link: string;
    try {
      link = await this.firebaseService.generateForgetPassword(data.email);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    const whatsappLink = generateWhatsAppLink(
      '01022419957',
      `Click this link to resetpassword ${link}`,
    );

    return {
      success: true,
      message: 'link sent to your whatsapp',
      data: whatsappLink,
    };
  }

  async deleteAccount(userId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        playerProfile: true,
        coachProfile: true,
        organizationProfile: true,
        adminProfile: true,
        notification: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    if (user.firebase_id) {
      try {
        await this.firebaseService.deleteUser(user.firebase_id);
      } catch (err) {
        console.log('Firebase deletion failed (maybe already deleted)', err);
      }
    }

    const timestamp = Date.now();

    const updates: any = {
      full_name: `DeletedUser_${timestamp}`,
      email: `deleted_${userId}_${timestamp}@example.com`,
      phone: `000000${timestamp}`,
      firebase_id: `deleted_${userId}_${timestamp}`,
      is_active: false,
    };

    if (user.playerProfile) {
      updates['playerProfile'] = {
        update: {
          guardianId: null,
        },
      };
    }
    if (user.coachProfile) {
      updates['coachProfile'] = {
        update: {
          bio: null,
          experience: null,
        },
      };
    }
    if (user.organizationProfile) {
      updates['organizationProfile'] = {
        update: {
          owner_name: `DeletedOrg_${timestamp}`,
          google_map_link: null,
          street_address: null,
          district: null,
          address_description: null,
        },
      };
    }
    if (user.adminProfile) {
      updates['adminProfile'] = {
        update: {},
      };
    }

    await this.prisma.notification.deleteMany({
      where: { user_id: userId },
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: updates,
      });
    });

    return {
      success: true,
      message: 'Account deleted successfull',
    };
  }
}
