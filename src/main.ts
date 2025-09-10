import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { WrapResponseInterceptor } from './shared/interceptors/wrap-response.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new WrapResponseInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
