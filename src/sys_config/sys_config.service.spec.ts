import { Test, TestingModule } from '@nestjs/testing';
import { SysConfigService } from './sys_config.service';

describe('SysConfigService', () => {
  let service: SysConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SysConfigService],
    }).compile();

    service = module.get<SysConfigService>(SysConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
