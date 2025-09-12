import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';

export class ParseBigIntPipe implements PipeTransform<string, bigint> {
  transform(value: string, metadata: ArgumentMetadata): bigint {
    if (!value) {
      throw new BadRequestException('Validation failed: value is missing');
    }

    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException(
        `Validation failed: "${value}" is not a valid bigint`,
      );
    }
  }
}
