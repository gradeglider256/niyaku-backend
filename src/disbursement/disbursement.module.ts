import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisbursementController } from './disbursement.controller';
import { DisbursementService } from './disbursement.service';
import { Loan } from './entities/loan.entity';
import {
  Disbursement,
  MobileMoneyDisbursement,
  BankDisbursement,
  PersonDisbursement,
} from './entities/disemburse.entity';
import { Branch } from '../user/entities/branch.entity';
import { Client } from '../clients/entities/client.entity';
import { AuthMiddleware } from '../user/auth.middleware';
import { UserModule } from '../user/user.module';

import { Repayment } from '../repayment/entity/repayment.entity';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Loan,
      Disbursement,
      MobileMoneyDisbursement,
      BankDisbursement,
      PersonDisbursement,
      Branch,
      Client,
      Repayment,
    ]),
    UserModule,
    DocumentsModule,
  ],
  controllers: [DisbursementController],
  providers: [DisbursementService],
  exports: [DisbursementService],
})
export class DisbursementModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(DisbursementController);
  }
}
