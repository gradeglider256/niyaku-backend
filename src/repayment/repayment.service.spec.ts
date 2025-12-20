import { Test, TestingModule } from '@nestjs/testing';
import { RepaymentService } from './repayment.service';

describe('RepaymentService', () => {
  let service: RepaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RepaymentService],
    }).compile();

    service = module.get<RepaymentService>(RepaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
