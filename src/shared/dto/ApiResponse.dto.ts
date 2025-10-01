import { applyDecorators, Type as NestType } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { BaseResponseDto } from './BaseResponse.dto';
import { PaginatedResponseDto } from './PaginatedResponse.dto';

export function ApiResponseDto<T>(model: NestType<T>, isPaginated = false) {
  return applyDecorators(
    ApiExtraModels(BaseResponseDto, model, PaginatedResponseDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(BaseResponseDto) },
          {
            properties: {
              data: isPaginated
                ? { $ref: getSchemaPath(PaginatedResponseDto) }
                : { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  );
}
