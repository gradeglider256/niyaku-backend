import { Test, TestingModule } from '@nestjs/testing';
import { SysConfigController } from './sys_config.controller';

describe('SysConfigController', () => {
  let controller: SysConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SysConfigController],
    }).compile();

    controller = module.get<SysConfigController>(SysConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
