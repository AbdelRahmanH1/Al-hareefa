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
import { RegisterUserRequestDto } from './dto/request/registration-request.dto';
import { CreatePlayerProfileRequestDto } from './dto/request/CreatePlayer-request.dto';
import { CreateCoachProfileRequestDto } from './dto/request/createCoach-request.dto';
import { CreateOrganizationProfileRequestDto } from './dto/request/CreateOrganization-request.dto';
import { FirebaseService } from './firebase/firebase.service';
import { PrismaClient } from '@prisma/client/extension';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly firebaseService: FirebaseService,
  ) {}

  /* async firebase(
    firebaseId: string,
  ): Promise<ResponseDto<FirebaseAuthResponseData>> {
    const firebaseData =
      await this.firebaseService.verifyFirebaseToken(firebaseId);
    if (!firebaseData || !firebaseData.uid)
      throw new UnauthorizedException('Invalid Firebase token');

    const { uid, email, name, picture } = firebaseData;
    let user = await this.prisma.user.findUnique({
      where: { firebase_id: uid },
    });

    if (user && user.role) {
      const token = this.jwtService.sign(
        { userId: user.id, firebaseId: user.firebase_id, role: user.role },
        { secret: jwtConfig.SECRET_KEY },
      );
      await this.redisService.saveToken(String(user.id), token);
      return {
        success: true,
        message: 'User logged in successfully',
        data: { token, needsProfileCompletion: !user.role },
      };
    }

    if (!email) {
      await this.firebaseService.deleteUser(uid);
      throw new BadRequestException('Email is required');
    }
    user = await this.prisma.user.create({
      data: {
        firebase_id: uid,
        full_name: name || 'new user',
        email,
        photo_url: picture || null,
      },
    });

    const token = this.jwtService.sign(
      { userId: user.id, firebaseId: user.firebase_id },
      { secret: jwtConfig.SECRET_KEY },
    );
    await this.redisService.saveToken(String(user.id), token);
    return {
      success: true,
      message: 'User registered successfully',
      data: { needsProfileCompletion: true, userId: user.id, token: token },
    };
  }

  async completeRegistration(
    userId: bigint,
    data: RegisterUserRequestDto,
  ): Promise<ResponseDto<any>> {
    const { birthDate, city, gender, phone, role } = data;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role) throw new BadRequestException('Profile already completed');

    let profile: any;
    switch (role) {
      case UserRole.PLAYER:
        profile = await this.createPlayerProfile(
          userId,
          birthDate,
          data.profile as CreatePlayerProfileRequestDto,
        );
        break;

      case UserRole.COACH:
        profile = await this.createCoachProfile(
          userId,
          data.profile as CreateCoachProfileRequestDto,
        );
        break;

      case UserRole.ORGANIZATION:
        profile = await this.createOrganizationProfile(
          userId,
          data.profile as CreateOrganizationProfileRequestDto,
        );
        break;
      default:
        throw new BadRequestException('Invalid role');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { role, phone, city, gender, birth_date: new Date(birthDate) },
    });

    return {
      success: true,
      message: 'Profile completed successfully',
      data: null,
    };
  } */

  /*  async firebase2(data: RegisterUserRequestDto) {
    const decodedToken = await this.firebaseService.verifyIdToken(
      data.firebase_token,
    );

    if (decodedToken.uid !== data.firebase_id) {
      throw new Error('Firebase token does not match firebase_id');
    }

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
      const profileExists =
        (user.role === UserRole.PLAYER && !!user.playerProfile) ||
        (user.role === UserRole.COACH && !!user.coachProfile) ||
        (user.role === UserRole.ORGANIZATION && !!user.organizationProfile);

      if (!profileExists) {
        throw new BadRequestException('Profile not completed yet');
      }

      const newToken = await this.firebaseService.createCustomToken(
        user.firebase_id,
        data.role,
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
    const newuser = await this.prisma.user.create({
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
          newuser.id,
          data.birthDate,
          data.profile as CreatePlayerProfileRequestDto,
          
        );
        break;
      case UserRole.COACH:
        await this.createCoachProfile(
          newuser.id,
          data.profile as CreateCoachProfileRequestDto,
        );
        break;
      case UserRole.ORGANIZATION:
        await this.createOrganizationProfile(
          newuser.id,
          data.profile as CreateOrganizationProfileRequestDto,
        
        );
        break;
    }

    await this.firebaseService.setCustomClaims(data.firebase_id, data.role);

    const newToken = await this.firebaseService.createCustomToken(
      data.firebase_id,
      data.role,
    );

    return {
      success: true,
      message: 'User registered successfully',
      data: {
        token: newToken,
      },
    };
  } */

  async firebase3(data: RegisterUserRequestDto) {
    let decodedToken;
    try {
      decodedToken = await this.firebaseService.verifyIdToken(
        data.firebase_token,
      );
    } catch (err) {
      throw new BadRequestException('Invalid or expired Firebase token');
    }

    if (decodedToken.uid !== data.firebase_id) {
      throw new BadRequestException(
        'Firebase token does not match firebase_id',
      );
    }

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

  async registerDummy() {
    const user = await this.prisma.user.create({
      data: {
        firebase_id: 'fake_firebase_uid_1006',
        full_name: 'Player4',
        email: 'player4@example.com',
        phone: '0213117251',
        role: UserRole.PLAYER,
        gender: Gender.MALE,
        city: 'Alexandria',
        birth_date: new Date('2020-01-01'),
      },
    });

    const playerProfile = await this.prisma.playerProfile.create({
      data: {
        preferred_games: { set: [GameType.FOOTBALL] },
        id: user.id,
        userId: user.id,
      },
    });

    /* const adminProfile = await this.prisma.adminProfile.create({
      data: { user_id: user.id, id: user.id },
    }); */

    /* const OrganizationProfile = await this.prisma.organizationProfile.create({
      data: {
        owner_name: 'Ahmed',
        id: user.id,
        user_id: user.id,
        type: OrganizationType.CLUB,
        district: 'nothing',
        street_address: 'nothing',
      },
    }); */

    /* const coachProfile = await this.prisma.coachProfile.create({
      data: { id: user.id, user_id: user.id },
    }); */
    return user;
  }
  /* async loginDummy() {
    const user = await this.prisma.user.findUnique({
      where: { email: 'player1@example.com' },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const token = this.jwtService.sign(
      { userId: user.id, firebaseId: user.firebase_id, role: user.role },
      { secret: jwtConfig.SECRET_KEY },
    );

    await this.redisService.saveToken(String(user.id), token);

    return { message: 'User created successfully', token };
  } */

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
