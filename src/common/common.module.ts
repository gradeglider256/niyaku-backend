import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { RequestTrackingInterceptor } from './interceptors/request-tracker.interceptor';

import { LoanStatusCron } from './cron/loan-status.cron';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repayment } from '../repayment/entity/repayment.entity';
import { ActivityLog } from './entities/activity-log.entity';
import { ActivityLogModule } from './activity-log/activity-log.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Repayment, ActivityLog]),
    ActivityLogModule,
  ],
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
  exports: [ActivityLogModule],
})
export class CommonModule {}
