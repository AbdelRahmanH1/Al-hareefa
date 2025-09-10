import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from 'src/shared/dto/response.dto';

@Injectable()
export class WrapResponseInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponseDto<T>> {
    return next.handle().pipe(
      map((data: any) => {
        const message = data?.message ?? null;

        const { message: _removed, ...rest } = data ?? {};

        const response: ResponseDto<T> = {
          success: true,
          message,
          data: Object.keys(rest).length > 0 ? rest : null,
        };

        return response;
      }),
    );
  }
}
