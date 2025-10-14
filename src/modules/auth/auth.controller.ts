import {
  Body,
  Controller,
  Delete,
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
import { ForgetPassowrdRequest } from './dto/request/Forget-passwor-request.dto';

@ApiTags('users')
@ApiExtraModels(
  CreatePlayerProfileRequestDto,
  CreateCoachProfileRequestDto,
  CreateOrganizationProfileRequestDto,
)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    return this.authService.getProfile(req.user.userId, req.user.role);
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
    schema: {
      example: { success: true, message: 'User update successfully' },
    },
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

  @Post('firebase2')
  @ApiOperation({ summary: 'create account with user profile' })
  async firebase2(@Body() data: RegisterUserRequestDto) {
    return this.authService.firebase3(data);
  }

  @Post('forget-password')
  @ApiOperation({ summary: 'Send password reset link via WhatsApp' })
  @ApiBody({ type: ForgetPassowrdRequest })
  @ApiResponse({
    status: 200,
    description: 'Password reset WhatsApp link generated successfully',
    schema: {
      example: {
        success: true,
        message: 'link sent to your whatsapp',
        data: 'link',
      },
    },
  })
  async forgetPassword(@Body() data: ForgetPassowrdRequest) {
    return this.authService.forgetPassowrd(data);
  }

  @Delete()
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Delete user account (and related profiles)' })
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Account deleted successfully',
        data: null,
      },
    },
  })
  async deleteAccount(@Req() req: { user: UserPayload }) {
    return this.authService.deleteAccount(req.user.userId);
  }
}
