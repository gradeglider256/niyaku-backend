import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepaymentController } from './repayment.controller';
import { RepaymentService } from './repayment.service';
import { Repayment } from './entity/repayment.entity';
import { Loan } from '../disbursement/entities/loan.entity';
import { AuthMiddleware } from '../user/auth.middleware';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Repayment, Loan]), UserModule],
  controllers: [RepaymentController],
  providers: [RepaymentService],
  exports: [RepaymentService],
})
export class RepaymentModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(RepaymentController);
  }
}
