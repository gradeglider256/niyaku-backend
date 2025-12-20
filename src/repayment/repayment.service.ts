import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Repayment } from './entity/repayment.entity';
import { Loan } from '../disbursement/entities/loan.entity';
import { CreateRepaymentDto } from './dto/create-repayment.dto';
import { PaginationQueryWithBranchDto } from '../common/dtos/pagination.dtos';
import { LoggerUtil } from '../common/utils/logger.util';

@Injectable()
export class RepaymentService {
    constructor(
        @InjectRepository(Repayment)
        private repaymentRepository: Repository<Repayment>,
        @InjectRepository(Loan)
        private loanRepository: Repository<Loan>,
        private dataSource: DataSource,
    ) { }

    async createRepayment(dto: CreateRepaymentDto, branchID: number) {
        const loan = await this.loanRepository.findOne({
            where: { id: dto.loanID },
            relations: ['client'],
        });

        if (!loan) {
            throw new NotFoundException(`Loan with ID ${dto.loanID} not found`);
        }

        const repayment = this.repaymentRepository.create({
            ...dto,
            clientID: loan.clientID,
            branchID,
            status: 'paid',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const saved = await this.repaymentRepository.save(repayment);
        LoggerUtil.logDatabaseCall(`INSERT INTO repayment`, 0, 'Repayment');
        return saved;
    }

    async getRepayments(pagination: PaginationQueryWithBranchDto) {
        const { page = 1, pageSize = 20, branchId } = pagination;
        const skip = (page - 1) * pageSize;

        const [data, total] = await this.repaymentRepository.findAndCount({
            where: branchId ? { branchID: branchId } : {},
            relations: ['client', 'loan'],
            skip,
            take: pageSize,
            order: { createdAt: 'DESC' },
        });

        return {
            data,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }

    async getRepaymentById(id: number) {
        const repayment = await this.repaymentRepository.findOne({
            where: { id },
            relations: ['client', 'loan'],
        });
        if (!repayment) throw new NotFoundException('Repayment record not found');
        return repayment;
    }
}
