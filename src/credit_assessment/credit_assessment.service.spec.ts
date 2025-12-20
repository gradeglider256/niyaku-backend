import { Test, TestingModule } from '@nestjs/testing';
import { CreditAssessmentService } from './credit_assessment.service';

describe('CreditAssessmentService', () => {
  let service: CreditAssessmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreditAssessmentService],
    }).compile();

    service = module.get<CreditAssessmentService>(CreditAssessmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
