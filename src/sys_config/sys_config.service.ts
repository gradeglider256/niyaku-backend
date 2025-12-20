import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from './entity/loan.settings.entity';

@Injectable()
export class SysConfigService {
    constructor(
        @InjectRepository(SystemConfig)
        private configRepository: Repository<SystemConfig>,
    ) { }

    async getConfigByBranch(branchID: number): Promise<SystemConfig> {
        const config = await this.configRepository.findOne({ where: { branchID } });
        if (!config) {
            // If not found, create one with defaults
            const newConfig = this.configRepository.create({ branchID });
            return this.configRepository.save(newConfig);
        }
        return config;
    }

    async updateConfig(branchID: number, updateData: Partial<SystemConfig>): Promise<SystemConfig> {
        const config = await this.getConfigByBranch(branchID);
        Object.assign(config, updateData);
        return this.configRepository.save(config);
    }
}
