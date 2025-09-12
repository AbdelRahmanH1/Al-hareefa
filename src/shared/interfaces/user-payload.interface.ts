import { UserRole } from '@prisma/client';

export interface UserPayload {
  userId: bigint;
  firebaseId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
