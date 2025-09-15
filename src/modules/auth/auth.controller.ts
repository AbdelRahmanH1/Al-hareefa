import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UpdateProfileDto } from './dto/request/updateProfile-request.dto';
import { UserPayload } from 'src/shared/interfaces/user-payload.interface';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserResponseDto } from './dto/response/UserResponse.dto';
import { UserResponseWrapperDto } from './dto/response/UserResponseWrapper.dto';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { AuthorizationGuard } from 'src/shared/guards/authorization.gurad';

@ApiTags('users')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register() {
    return this.authService.registerDummy();
  }

  @Post('login')
  async login() {
    return this.authService.loginDummy();
  }

  @Get('me')
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile fetched successfully',
    type: UserResponseWrapperDto,
  })
  async me(@Req() req: { user: UserPayload }) {
    return this.authService.getProfile(req.user.userId);
  }

  @Put('/')
  @UseGuards(
    AuthenticationGuard,
    AuthorizationGuard(
      UserRole.ADMIN,
      UserRole.COACH,
      UserRole.ORGANIZATION,
      UserRole.PLAYER,
    ),
  )
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserResponseWrapperDto,
  })
  async updateUser(
    @Req() req: { user: UserPayload },
    @Body() updateUserDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(
      req.user.userId,
      req.user.role,
      updateUserDto,
    );
  }

  /* @Post('firebase-register')
  async Fire(@Body() dto: RegisterUserDto) {
    // 1. Check if user already exists
    const existing = await this.userService.findByFirebaseUid(dto.firebaseUid);
    if (existing) throw new BadRequestException('User already exists');

    // 2. Age validation
    const birthDate = new Date(dto.birthDate);
    const age = Math.floor(
      (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25),
    );

    if (
      dto.role === 'PLAYER' &&
      age < 18 &&
      !('guardianId' in dto.profile && dto.profile.guardianId)
    ) {
      throw new BadRequestException(
        'Players under 18 must provide guardian information',
      );
    }

    if ((dto.role === 'COACH' || dto.role === 'ORGANIZATION') && age < 18) {
      throw new BadRequestException(
        `${dto.role} must be at least 18 years old`,
      );
    }

    // 3. Create user
    const user = await this.userService.createUser({
      firebaseUid: dto.firebaseUid,
      email: dto.email,
      fullName: dto.fullName,
      role: dto.role,
      birthDate: birthDate,
    });

    // 4. Create profile based on role
    switch (dto.role) {
      case 'PLAYER':
        await this.userService.createPlayerProfile(user.id, dto.profile);
        break;
      case 'COACH':
        await this.userService.createCoachProfile(user.id, dto.profile);
        break;
      case 'ORGANIZATION':
        await this.userService.createOrganizationProfile(user.id, dto.profile);
        break;
      default:
        throw new BadRequestException('Invalid role');
    }

    // 5. Issue JWT
    const token = this.jwtService.sign({ userId: user.id, role: user.role });

    // 6. Store JWT in Redis
    await this.redisService.set(`user:${user.id}:token`, token);

    return {
      success: true,
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  } */
}
