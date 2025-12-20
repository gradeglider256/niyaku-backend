import { Test, TestingModule } from '@nestjs/testing';
import { CreditAssessmentController } from './credit_assessment.controller';

describe('CreditAssessmentController', () => {
  let controller: CreditAssessmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreditAssessmentController],
    }).compile();

    controller = module.get<CreditAssessmentController>(CreditAssessmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
