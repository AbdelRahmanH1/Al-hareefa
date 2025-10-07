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
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { UserResponseWrapperDto } from './dto/response/UserResponseWrapper.dto';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { AuthorizationGuard } from 'src/shared/guards/authorization.gurad';
import { RegisterUserRequestDto } from './dto/request/registration-request.dto';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { FirebaseAuthResponseData } from './firebase/FirebaseAuthResponseData ';
import { CreatePlayerProfileRequestDto } from './dto/request/CreatePlayer-request.dto';
import { CreateCoachProfileRequestDto } from './dto/request/createCoach-request.dto';
import { CreateOrganizationProfileRequestDto } from './dto/request/CreateOrganization-request.dto';

@ApiTags('users')
@ApiExtraModels(
  CreatePlayerProfileRequestDto,
  CreateCoachProfileRequestDto,
  CreateOrganizationProfileRequestDto,
)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /* @Post('register')
  async register() {
    return this.authService.registerDummy();
  } */

  /*  @Post('login')
  async login() {
    return this.authService.loginDummy();
  } */

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

  /* @Post('firebase')
  @ApiOperation({ summary: 'Login or signup using Firebase token' })
  @ApiBody({
    description: 'Firebase ID token',
    schema: { type: 'object', properties: { firebaseId: { type: 'string' } } },
  })
  @ApiResponse({
    status: 200,
    description: 'User logged in or registered successfully',
    type: FirebaseAuthResponseData,
  })
  async firebase(@Body('firebaseId') firebaseId: string) {
    return this.authService.firebase(firebaseId);
  }

  @Post('complete-registration')
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Complete user registration with full profile' })
  @ApiExtraModels(
    CreatePlayerProfileRequestDto,
    CreateCoachProfileRequestDto,
    CreateOrganizationProfileRequestDto,
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firebase_id: { type: 'string' },
        email: { type: 'string' },
        full_name: { type: 'string' },
        phone: { type: 'string' },
        gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
        city: { type: 'string' },
        role: { type: 'string', enum: ['PLAYER', 'COACH', 'ORGANIZATION'] },
        birthDate: { type: 'string', format: 'date' },
        profile: {
          oneOf: [
            { $ref: getSchemaPath(CreatePlayerProfileRequestDto) },
            { $ref: getSchemaPath(CreateCoachProfileRequestDto) },
            { $ref: getSchemaPath(CreateOrganizationProfileRequestDto) },
          ],
        },
      },
      required: ['firebase_id', 'email', 'full_name', 'role', 'profile'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile completed successfully',
    type: ResponseDto,
  })
  async completeRegistration(
    @Req() req: { user: UserPayload },
    @Body() data: RegisterUserRequestDto,
  ): Promise<ResponseDto<any>> {
    return this.authService.completeRegistration(req.user.userId, data);
  } */

  @Post('firebase2')
  async firebase2(@Body() data: RegisterUserRequestDto) {
    return this.authService.firebase3(data);
  }
}
