import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { RedisJwtService } from 'src/redis/redis-jwt.service';
import { jwtConfig } from 'src/config/JwtConfig';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: jwtConfig.SECRET_KEY,
    }),
  ],
  providers: [AuthService, RedisJwtService],
  controllers: [AuthController],
})
export class AuthModule {}
