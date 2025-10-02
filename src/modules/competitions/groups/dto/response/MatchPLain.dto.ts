import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ParticipantPlainDto } from './ParticipantPlain.dtop';

export class MatchPlainDto {
  @ApiProperty()
  @Expose()
  id: bigint;

  @ApiProperty({ type: ParticipantPlainDto, nullable: true })
  @Expose()
  @Type(() => ParticipantPlainDto)
  participant1: ParticipantPlainDto | null;

  @ApiProperty({ type: ParticipantPlainDto, nullable: true })
  @Expose()
  @Type(() => ParticipantPlainDto)
  participant2: ParticipantPlainDto | null;

  @ApiProperty({ example: 'SCHEDULED' })
  @Expose()
  status: string;

  @ApiProperty({ example: 'GROUP_STAGE' })
  @Expose()
  stage: string;

  @ApiProperty({ example: null, description: 'Score for participant 1' })
  @Expose()
  score_participant1?: number;

  @ApiProperty({ example: null, description: 'Score for participant 2' })
  @Expose()
  score_participant2?: number;

  @ApiProperty({ example: null, description: 'Optional match date' })
  @Expose()
  scheduled_at?: Date;
}
