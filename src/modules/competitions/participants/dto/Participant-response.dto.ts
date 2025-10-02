import { ApiProperty } from '@nestjs/swagger';
import { ApprovalStatus } from '@prisma/client';
import { Expose } from 'class-transformer';

export class ParticipantResponseDto {
  @ApiProperty()
  @Expose()
  id: bigint;

  @ApiProperty()
  @Expose()
  competition_id: bigint;

  @ApiProperty()
  @Expose()
  competition_name: string;

  @ApiProperty()
  @Expose()
  player_id?: bigint;

  @ApiProperty()
  @Expose()
  team_id?: bigint;

  @ApiProperty({ enum: ApprovalStatus })
  @Expose()
  status: ApprovalStatus;

  @ApiProperty()
  @Expose()
  registered_at: Date;

  @ApiProperty()
  @Expose()
  payment_required?: number;

  @ApiProperty()
  @Expose()
  pay_link?: string;
}
