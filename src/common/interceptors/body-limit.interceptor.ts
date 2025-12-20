// src/common/interceptors/body-limit.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, PayloadTooLargeException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import * as bodyParser from 'body-parser';
import { BODY_LIMIT_KEY } from '../decorators/body-limit.decorator';

@Injectable()
export class BodyLimitInterceptor implements NestInterceptor {
    constructor(private reflector: Reflector) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const limit = this.reflector.get<string>(BODY_LIMIT_KEY, context.getHandler());

        if (limit) {
            const request = context.switchToHttp().getRequest();
            const response = context.switchToHttp().getResponse();

            await new Promise((resolve, reject) => {
                bodyParser.json({ limit })(request, response, (err) => {
                    if (err) {
                        reject(new PayloadTooLargeException('Request body exceeds 5MB limit'));
                    }
                    resolve(true);
                });
            });
        }

        return next.handle();
    }
}