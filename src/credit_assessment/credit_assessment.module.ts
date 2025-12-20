import { Module } from '@nestjs/common';
import { CreditAssessmentController } from './credit_assessment.controller';
import { CreditAssessmentService } from './credit_assessment.service';

@Module({
  controllers: [CreditAssessmentController],
  providers: [CreditAssessmentService]
})
export class CreditAssessmentModule {}
