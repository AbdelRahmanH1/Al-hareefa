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
    private readonly firebaseService: FirebaseService,
  ) {}

  async firebase3(data: RegisterUserRequestDto) {
    let newUser: any;

    const existing = await this.prisma.user.findUnique({
      where: { firebase_id: data.firebase_id },
    });

    if (existing) {
      throw new BadRequestException(
        'User with this Firebase ID already exists',
      );
    }

    if (!data.profile)
      throw new BadRequestException('Profile data is required for this role');

    try {
      newUser = await this.prisma.$transaction(async (tx) => {
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

      try {
        await this.firebaseService.setCustomClaims(
          newUser.firebase_id,
          newUser.id,
          newUser.role,
        );

        return {
          success: true,
          message: 'User registered successfully',
          data: null,
        };
      } catch (firebaseError) {
        await this.prisma.$transaction(async (tx) => {
          if (newUser.role === UserRole.PLAYER)
            await tx.playerProfile.deleteMany({
              where: { userId: newUser.id },
            });
          if (newUser.role === UserRole.COACH)
            await tx.coachProfile.deleteMany({
              where: { user_id: newUser.id },
            });
          if (newUser.role === UserRole.ORGANIZATION)
            await tx.organizationProfile.deleteMany({
              where: { user_id: newUser.id },
            });
          await tx.user.delete({ where: { id: newUser.id } });
        });

        throw new BadRequestException(
          `Failed to set Firebase token: ${firebaseError.message}`,
        );
      }
    } catch (error) {
      throw error;
    }
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

  async getProfile(
    userId: bigint,
    UserRole: UserRole,
  ): Promise<ResponseDto<UserResponseDto>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        playerProfile: UserRole == 'PLAYER',
        organizationProfile: UserRole == 'ORGANIZATION',
        coachProfile: UserRole == 'COACH',
        adminProfile: UserRole == 'ADMIN',
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
    role: UserRole,
    request: UpdateProfileDto,
  ): Promise<ResponseDto<null>> {
    const { playerProfile, coachProfile, organizationProfile, user } = request;

    const userData = user
      ? Object.fromEntries(
          Object.entries(user).filter(([_, v]) => v !== undefined),
        )
      : {};

    const profileData = {
      PLAYER: playerProfile
        ? Object.fromEntries(
            Object.entries(playerProfile).filter(([_, v]) => v !== undefined),
          )
        : null,
      COACH: coachProfile
        ? Object.fromEntries(
            Object.entries(coachProfile).filter(([_, v]) => v !== undefined),
          )
        : null,
      ORGANIZATION: organizationProfile
        ? Object.fromEntries(
            Object.entries(organizationProfile).filter(
              ([_, v]) => v !== undefined,
            ),
          )
        : null,
    };

    await this.prisma.$transaction(async (tx) => {
      if (Object.keys(userData).length) {
        await tx.user.update({
          where: { id: userId },
          data: userData,
        });
      }

      switch (role) {
        case UserRole.PLAYER:
          if (profileData.PLAYER) {
            await tx.playerProfile.update({
              where: { id: userId },
              data: profileData.PLAYER,
            });
          }
          break;

        case UserRole.COACH:
          if (profileData.COACH) {
            await tx.coachProfile.update({
              where: { id: userId },
              data: profileData.COACH,
            });
          }
          break;

        case UserRole.ORGANIZATION:
          if (profileData.ORGANIZATION) {
            await tx.organizationProfile.update({
              where: { id: userId },
              data: profileData.ORGANIZATION,
            });
          }
          break;

        case UserRole.ADMIN:
          break;
      }
    });

    return {
      success: true,
      message: 'Profile updated successfully',
      data: null,
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
