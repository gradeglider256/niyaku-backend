import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLog } from '../entities/activity-log.entity';
import { ActivityLogService } from '../services/activity-log.service';
import { ActivityLogController } from '../controllers/activity-log.controller';
import { ActivityLogInterceptor } from '../interceptors/activity-log.interceptor';
import { UserModule } from '../../user/user.module';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog]), UserModule],
  controllers: [ActivityLogController],
  providers: [
    ActivityLogService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityLogInterceptor,
    },
  ],
  exports: [ActivityLogService],
})
export class ActivityLogModule {}
