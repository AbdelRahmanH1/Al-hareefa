import { ApprovalStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateOrganizationStatusDto {
  @IsEnum(ApprovalStatus)
  status: ApprovalStatus;
}
