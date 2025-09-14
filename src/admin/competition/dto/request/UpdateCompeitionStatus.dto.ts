import { ApprovalStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateCompetitionStatusDto {
  @IsEnum(ApprovalStatus)
  status: ApprovalStatus;
}
