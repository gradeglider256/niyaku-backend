import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Repayment } from '../../repayment/entity/repayment.entity';
import { LoggerUtil } from '../utils/logger.util';

@Injectable()
export class LoanStatusCron {
    constructor(
        @InjectRepository(Repayment)
        private readonly repaymentRepository: Repository<Repayment>,
    ) { }

    @Cron('0 0 0,12 * * *') // Twice a day: midnight and noon
    async handleOverdueRepayments() {
        LoggerUtil.logDatabaseCall('CRON JOB STARTED: Checking overdue repayments', 0, 'Cron');

        const today = new Date().toISOString().split('T')[0];

        // Find repayments that are pending and dateToBePaid is strictly less than today
        const overdueRepayments = await this.repaymentRepository.find({
            where: {
                status: 'pending',
                dateToBePaid: LessThan(today),
            },
            relations: ['loan'],
        });

        if (overdueRepayments.length === 0) {
            LoggerUtil.logDatabaseCall('CRON JOB ENDED: No overdue repayments found', 0, 'Cron');
            return;
        }

        for (const repayment of overdueRepayments) {
            repayment.status = 'overdue';
            await this.repaymentRepository.save(repayment);

            // We could also update the Loan status if needed, but the prompt asked: "mark it as over due"
            // Ambiguity: "mark the loan as overdue". But logic often is the repayment.
            // If we need to mark the loan, we'd need an 'overdue' status in Loan enum which isn't there yet.
            // Sticking to marking the Repayment as 'overdue' which is in its enum.
        }

        LoggerUtil.logDatabaseCall(`CRON JOB ENDED: Marked ${overdueRepayments.length} repayments as overdue`, 0, 'Cron');
    }
}
