import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/JwtConfig';
import { RedisJwtService } from 'src/redis/redis-jwt.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redis: RedisJwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token missing or invalid');
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: jwtConfig.SECRET_KEY,
      });
      const isValid = await this.redis.validateToken(decoded.userId, token);
      if (!isValid) {
        throw new UnauthorizedException('token expired');
      }
      request.user = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token invalid');
    }
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers['authorization'];
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === jwtConfig.BEARER_KEY ? token : undefined;
  }
}
