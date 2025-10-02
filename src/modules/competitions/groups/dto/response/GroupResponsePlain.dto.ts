// GroupResponsePlain.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ParticipantPlainDto } from './ParticipantPlain.dtop';
import { MatchPlainDto } from './MatchPLain.dto';

export class GroupResponsePlainDto {
  @ApiProperty()
  @Expose()
  id: bigint;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  competitionId: bigint;

  @ApiProperty({ type: [ParticipantPlainDto] })
  @Expose()
  @Type(() => ParticipantPlainDto)
  members: ParticipantPlainDto[];

  @ApiProperty({ type: [MatchPlainDto] })
  @Expose()
  @Type(() => MatchPlainDto)
  matches: MatchPlainDto[];
}
