import { Module } from '@nestjs/common';
import { DisbursementController } from './disbursement.controller';
import { DisbursementService } from './disbursement.service';

@Module({
  controllers: [DisbursementController],
  providers: [DisbursementService]
})
export class DisbursementModule {}
