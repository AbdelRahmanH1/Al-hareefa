import { ApiProperty } from '@nestjs/swagger';
import { ApprovalStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateOrganizationStatusDto {
  @ApiProperty({ enum: ApprovalStatus })
  @IsEnum(ApprovalStatus)
  status: ApprovalStatus;
}
