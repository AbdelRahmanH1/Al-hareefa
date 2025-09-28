import { ApiProperty } from '@nestjs/swagger';
import { GroupParticipantDto } from './GroupParticipantResponse.dto';

export class GroupResponseDto {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 'Group A' })
  name: string;

  @ApiProperty({ example: 1 })
  competitionId: bigint;

  @ApiProperty({ type: [GroupParticipantDto] })
  members: GroupParticipantDto[];
}
