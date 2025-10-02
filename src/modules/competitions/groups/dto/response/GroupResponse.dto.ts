import { ApiProperty } from '@nestjs/swagger';
import { GroupParticipantDto } from './GroupParticipantResponse.dto';
import { Expose, Transform } from 'class-transformer';

export class GroupResponseDto {
  @ApiProperty({ example: '1' })
  @Expose()
  @Transform(({ value }) => value.toString())
  id: string;

  @ApiProperty({ example: 'Group A' })
  @Expose()
  name: string;

  @ApiProperty({ example: '1' })
  @Expose()
  @Transform(({ value }) => value.toString())
  competitionId: string;

  @ApiProperty({ type: [GroupParticipantDto] })
  @Expose()
  members: GroupParticipantDto[];
}
