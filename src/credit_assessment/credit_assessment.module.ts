import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditAssessmentController } from './credit_assessment.controller';
import { CreditAssessmentService } from './credit_assessment.service';
import { EmploymentHistory } from './entities/employment.entity';
import { SalaryHistory } from './entities/salary.entity';
import { CompanyEarnings } from './entities/company-earnings.entity';
import { AssessmentReport } from './entities/assessment-report.entity';
import { Client } from '../clients/entities/client.entity';
import { Branch } from '../user/entities/branch.entity';
import { Profile } from '../user/entities/profile.entity';
import { Repayment } from '../repayment/entity/repayment.entity';
import { DocumentsModule } from '../documents/documents.module';
import { AuthMiddleware } from '../user/auth.middleware';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmploymentHistory,
      SalaryHistory,
      CompanyEarnings,
      AssessmentReport,
      Client,
      Branch,
      Profile,
      Repayment,
    ]),
    UserModule,
    DocumentsModule,
  ],

  controllers: [CreditAssessmentController],
  providers: [CreditAssessmentService],
  exports: [CreditAssessmentService],
})
export class CreditAssessmentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(CreditAssessmentController);
  }
}
