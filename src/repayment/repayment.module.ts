import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepaymentController } from './repayment.controller';
import { RepaymentService } from './repayment.service';
import { Repayment } from './entity/repayment.entity';
import { Loan } from '../disbursement/entities/loan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Repayment, Loan])],
  controllers: [RepaymentController],
  providers: [RepaymentService],
  exports: [RepaymentService],
})
export class RepaymentModule { }
