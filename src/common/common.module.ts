import { Global, MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { RequestTrackingInterceptor } from './interceptors/request-tracker.interceptor';
import { ActivityLogInterceptor } from './interceptors/activity-log.interceptor';

import { LoanStatusCron } from './cron/loan-status.cron';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repayment } from '../repayment/entity/repayment.entity';
import { ActivityLog } from './entities/activity-log.entity';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { AuthMiddleware } from '../user/auth.middleware';
import { ActivityLogController } from './controllers/activity-log.controller';
import { UserModule } from '../user/user.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Repayment, ActivityLog]),
    ActivityLogModule,
    UserModule
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
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityLogInterceptor,
    },
    LoanStatusCron,
  ],
  exports: [ActivityLogModule],
})
export class CommonModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(ActivityLogController);
  }
}
