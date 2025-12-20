import { Module } from '@nestjs/common';
import { SysConfigController } from './sys_config.controller';
import { SysConfigService } from './sys_config.service';

@Module({
  controllers: [SysConfigController],
  providers: [SysConfigService]
})
export class SysConfigModule {}
