import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { jwtConfig } from 'src/config/JwtConfig';
import * as admin from 'firebase-admin';
import { FirebaseService } from 'src/modules/auth/firebase/firebase.service';
import { UserRole } from '@prisma/client';
import { UserPayload } from '../interfaces/user-payload.interface';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const idToken = this.extractTokenFromHeader(request);

    if (!idToken) {
      throw new UnauthorizedException('Token missing or invalid');
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken, true);
      const user: UserPayload = {
        userId: BigInt(decodedToken.userId),
        role: decodedToken.role as UserRole,
      };
      request.user = user;
      return true;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        throw new UnauthorizedException('User not found');
      }
      throw new UnauthorizedException('Token invalid or revoked');
    }
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers['authorization'];
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === jwtConfig.BEARER_KEY ? token : undefined;
  }
}
