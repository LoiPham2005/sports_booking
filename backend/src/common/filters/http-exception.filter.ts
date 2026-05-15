import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Internal server error';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'string') {
        message = response;
        code = HttpStatus[status] ?? 'ERROR';
      } else {
        const r = response as { message?: string | string[]; error?: string; code?: string };
        message = Array.isArray(r.message) ? r.message.join('; ') : r.message ?? 'Error';
        code = r.code ?? r.error ?? HttpStatus[status] ?? 'ERROR';
        details = (response as Record<string, unknown>)['details'];
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        code = 'UNIQUE_CONSTRAINT';
        message = 'Resource already exists';
        details = exception.meta;
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        code = 'NOT_FOUND';
        message = 'Resource not found';
      } else {
        status = HttpStatus.BAD_REQUEST;
        code = `PRISMA_${exception.code}`;
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(exception.stack);
    }

    res.status(status).json({
      code,
      message,
      details,
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}
