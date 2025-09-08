import { HttpException, HttpStatus } from '@nestjs/common';

export const asyncHandler = (
  fn: Function,
  errorMessage = 'Something went wrong',
  statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
) => {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (err) {
      // Forward HttpExceptions directly
      if (err instanceof HttpException) {
        throw err;
      }

      // Otherwise, wrap into HttpException
      throw new HttpException(errorMessage, statusCode);
    }
  };
};
