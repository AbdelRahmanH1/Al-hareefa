import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class JoinTeamDto {
  @IsString()
  @ApiProperty({ description: 'Invite token' })
  token: string;
}
