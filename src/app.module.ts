import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ClientsModule } from './clients/clients.module';
import { CreditAssessmentModule } from './credit_assessment/credit_assessment.module';
import { DisbursementModule } from './disbursement/disbursement.module';
import { RepaymentModule } from './repayment/repayment.module';
import { ReportsModule } from './reports/reports.module';
import { ComplianceModule } from './compliance/compliance.module';
import { NotificationModule } from './notification/notification.module';
import { SysConfigModule } from './sys_config/sys_config.module';
import { PostgreDbModule } from './postgre_db/postgre_db.module';
import { ConfigModule } from '@nestjs/config';
import { RedisDbModule } from './redis_db/redis_db.module';
import { CommonModule } from './common/common.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    CommonModule,
    PrometheusModule.register({
      path: '/metrics',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UserModule,
    ClientsModule,
    CreditAssessmentModule,
    DisbursementModule,
    RepaymentModule,
    ReportsModule,
    ComplianceModule,
    NotificationModule,
    SysConfigModule,
    PostgreDbModule,
    RedisDbModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
