import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.path === '/') {
      return next();
    }
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;

      let statusColor = '\x1b[32m';
      if (statusCode >= 400 && statusCode < 500) statusColor = '\x1b[33m';
      if (statusCode >= 500) statusColor = '\x1b[31m';

      console.log(
        `${method} ${originalUrl} ${statusColor}${statusCode}\x1b[0m - ${duration}ms`,
      );
    });

    next();
  }
}
