import { UserRole } from '@prisma/client';

export interface UserPayload {
  userId: bigint;
  role: UserRole;
}
