import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerUtil } from '../utils/logger.util';

@Injectable()
export class RequestTrackingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    LoggerUtil.trackRequest();

    return next.handle().pipe(
      tap(() => {
        // Request completed successfully
      }),
    );
  }
}
