/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { LoggerUtil } from '../utils/logger.util';
import { ErrorResponse } from '../interfaces/response.interface';
import { ResponseUtil } from '../utils/response.utils';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: ErrorResponse;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        errorResponse = ResponseUtil.error(
          status,
          exception.message,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          (exceptionResponse as any).message || exception.message,
        );
      } else {
        errorResponse = ResponseUtil.error(
          status,
          exception.message,
          exception.message,
        );
      }
    } else if (exception instanceof Error) {
      // Log unexpected errors
      LoggerUtil.logError(exception, 'GlobalExceptionFilter', {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        path: request.url,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        method: request.method,
      });

      errorResponse = ResponseUtil.error(
        status,
        'Internal server error',
        'An unexpected error occurred',
      );
    } else {
      LoggerUtil.logError(String(exception), 'GlobalExceptionFilter', {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        path: request.url,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        method: request.method,
      });

      errorResponse = ResponseUtil.error(
        status,
        'Internal server error',
        'An unexpected error occurred',
      );
    }

    response.status(status).json(errorResponse);
  }
}
