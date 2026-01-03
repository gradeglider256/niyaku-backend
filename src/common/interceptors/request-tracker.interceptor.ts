/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { LoggerUtil } from '../utils/logger.util';
import { Request, Response } from 'express';

@Injectable()
export class RequestTrackingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Capture request start time
    const startTime = Date.now();

    // Extract request details
    const method = request.method;
    const url = request.url;
    const userAgent = request.headers['user-agent'] || 'unknown';

    // Extract IP address (handle proxy headers)
    let ipAddress = request.ip;
    if (!ipAddress || ipAddress === '::1' || ipAddress === '127.0.0.1') {
      const forwardedFor = request.headers['x-forwarded-for'];
      if (forwardedFor) {
        ipAddress = Array.isArray(forwardedFor)
          ? forwardedFor[0]
          : forwardedFor.split(',')[0].trim();
      } else {
        const realIp = request.headers['x-real-ip'];
        if (realIp) {
          ipAddress = Array.isArray(realIp) ? realIp[0] : realIp;
        }
      }
    }

    // Extract user ID if authenticated
    const userId = (request as any).user?.id || (request as any).user?.auth?.id;

    // Keep existing request-per-second tracking
    LoggerUtil.trackRequest();

    // Track status code and duration
    let statusCode = 200;

    return next.handle().pipe(
      tap({
        next: () => {
          statusCode = response.statusCode;
        },
        error: (error) => {
          // Extract status code from error if available
          if (error?.status) {
            statusCode = error.status;
          } else if (error?.response?.statusCode) {
            statusCode = error.response.statusCode;
          } else {
            statusCode = 500; // Default for unhandled errors
          }
        },
      }),
      finalize(() => {
        // Calculate duration
        const duration = Date.now() - startTime;

        // Log the request with all details
        LoggerUtil.logRequest(
          method,
          url,
          statusCode,
          duration,
          ipAddress,
          userAgent,
          userId,
        );
      }),
    );
  }
}
