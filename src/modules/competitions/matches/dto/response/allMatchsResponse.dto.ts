import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchStage, MatchStatus } from '@prisma/client';

export class ParticipantInfoDto {
  @ApiProperty({
    type: String,
    description: 'Participant ID (bigint as string)',
  })
  id: string;

  @ApiProperty()
  name: string;
}

export class AllMatchResponseDto {
  @ApiProperty({ description: 'Match ID (bigint as string)' })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Competition ID (bigint as string)',
  })
  competitionId: string;

  @ApiProperty({ type: ParticipantInfoDto })
  participant1: ParticipantInfoDto;

  @ApiProperty({ type: ParticipantInfoDto, nullable: true })
  participant2: ParticipantInfoDto | null;

  @ApiProperty({ enum: MatchStage, type: String, nullable: true })
  stage: MatchStage | null;

  @ApiProperty({ enum: MatchStatus, type: String })
  status: MatchStatus;

  @ApiProperty({ type: Date, nullable: true })
  scheduledAt: Date | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  venueName?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  venueAddress?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  venueCity?: string | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  scoreParticipant1?: number | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  scoreParticipant2?: number | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Winner participant ID (bigint as string)',
  })
  winnerParticipantId?: string | null;
}
