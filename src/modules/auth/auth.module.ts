import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { RedisJwtService } from 'src/redis/redis-jwt.service';
import { jwtConfig } from 'src/config/JwtConfig';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FirebaseService } from './firebase/firebase.service';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: jwtConfig.SECRET_KEY,
    }),
    FirebaseModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
