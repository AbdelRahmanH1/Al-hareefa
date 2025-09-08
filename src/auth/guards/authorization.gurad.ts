import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const AuthorizationGuard = (...roles: UserRole[]): CanActivate => {
  @Injectable()
  class RoleGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      if (!user || !roles.includes(user.role)) {
        throw new ForbiddenException("Can't access");
      }
      return true;
    }
  }

  return new RoleGuard();
};
