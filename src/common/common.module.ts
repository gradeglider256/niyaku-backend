import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { RequestTrackingInterceptor } from './interceptors/request-tracker.interceptor';

import { LoanStatusCron } from './cron/loan-status.cron';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repayment } from '../repayment/entity/repayment.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Repayment])],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestTrackingInterceptor,
    },
    LoanStatusCron,
  ],
  exports: [],
})
export class CommonModule { }
