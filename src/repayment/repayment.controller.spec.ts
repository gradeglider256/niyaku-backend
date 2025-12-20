import { Test, TestingModule } from '@nestjs/testing';
import { RepaymentController } from './repayment.controller';

describe('RepaymentController', () => {
  let controller: RepaymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepaymentController],
    }).compile();

    controller = module.get<RepaymentController>(RepaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
