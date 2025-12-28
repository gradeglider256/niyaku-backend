import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Loan } from '../disbursement/entities/loan.entity';
import { Repayment } from '../repayment/entity/repayment.entity';
import { Disbursement } from '../disbursement/entities/disemburse.entity';
import { AuthMiddleware } from '../user/auth.middleware';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Loan, Repayment, Disbursement]), UserModule],
  controllers: [ReportsController],
  providers: [ReportsService]
})
export class ReportsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(ReportsController);
  }
}
