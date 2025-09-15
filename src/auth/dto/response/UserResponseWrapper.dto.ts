import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './UserResponse.dto';

export class UserResponseWrapperDto {
  @ApiProperty({ description: 'Whether the request was successful' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'User data', type: () => UserResponseDto })
  data: UserResponseDto;
}
