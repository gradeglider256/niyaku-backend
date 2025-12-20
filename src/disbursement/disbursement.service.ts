import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from './entities/loan.entity';
import {
    Disbursement,
    MobileMoneyDisbursement,
    BankDisbursement,
    PersonDisbursement,
} from './entities/disemburse.entity';
import {
    CreateLoanDto,
    UpdateLoanDto,
    CreateDisbursementDto,
    UpdateDisbursementDto,
} from './dto/disbursement.dto';
import { PaginationQueryWithBranchDto } from '../common/dtos/pagination.dtos';
import { LoggerUtil } from '../common/utils/logger.util';

@Injectable()
export class DisbursementService {
    constructor(
        @InjectRepository(Loan)
        private loanRepository: Repository<Loan>,
        @InjectRepository(Disbursement)
        private disbursementRepository: Repository<Disbursement>,
        @InjectRepository(MobileMoneyDisbursement)
        private mobileRepository: Repository<MobileMoneyDisbursement>,
        @InjectRepository(BankDisbursement)
        private bankRepository: Repository<BankDisbursement>,
        @InjectRepository(PersonDisbursement)
        private personRepository: Repository<PersonDisbursement>,
    ) { }

    // --- Loan Operations ---

    async createLoan(createLoanDto: CreateLoanDto, branchID: number): Promise<Loan> {
        const loan = this.loanRepository.create({
            ...createLoanDto,
            branchID,
            status: 'pending',
        });
        const saved = await this.loanRepository.save(loan);
        LoggerUtil.logDatabaseCall(`INSERT INTO loan`, 0, 'Disbursement');
        return saved;
    }

    async updateLoan(id: number, updateLoanDto: UpdateLoanDto, branchID: number): Promise<Loan> {
        const loan = await this.loanRepository.findOne({ where: { id, branchID } });
        if (!loan) {
            throw new NotFoundException(`Loan with ID ${id} not found in your branch`);
        }
        Object.assign(loan, updateLoanDto);
        const saved = await this.loanRepository.save(loan);
        LoggerUtil.logDatabaseCall(`UPDATE loan SET ...`, 0, 'Disbursement');
        return saved;
    }

    async getLoan(id: number, branchID: number): Promise<Loan> {
        const loan = await this.loanRepository.findOne({
            where: { id, branchID },
            relations: ['client', 'branch'],
        });
        if (!loan) {
            throw new NotFoundException(`Loan with ID ${id} not found`);
        }
        return loan;
    }

    async getLoans(pagination: PaginationQueryWithBranchDto) {
        const { page = 1, pageSize = 20, branchId } = pagination;
        const skip = (page - 1) * pageSize;

        const [data, total] = await this.loanRepository.findAndCount({
            where: { branchID: branchId },
            relations: ['client'],
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

    async deleteLoan(id: number, branchID: number): Promise<void> {
        const result = await this.loanRepository.delete({ id, branchID });
        if (result.affected === 0) {
            throw new NotFoundException(`Loan with ID ${id} not found`);
        }
        LoggerUtil.logDatabaseCall(`DELETE FROM loan`, 0, 'Disbursement');
    }

    // --- Disbursement Operations ---

    async createDisbursement(
        createDisbursementDto: CreateDisbursementDto,
        branchID: number,
    ): Promise<Disbursement> {
        // Verify loan exists and is in the same branch
        const loan = await this.loanRepository.findOne({
            where: { id: createDisbursementDto.loanID, branchID },
        });

        if (!loan) {
            throw new NotFoundException(
                `Loan with ID ${createDisbursementDto.loanID} not found in your branch`,
            );
        }

        let disbursement: Disbursement;

        switch (createDisbursementDto.type) {
            case 'mobile':
                disbursement = this.mobileRepository.create({
                    ...createDisbursementDto,
                    branchID,
                });
                break;
            case 'bank':
                disbursement = this.bankRepository.create({
                    ...createDisbursementDto,
                    branchID,
                });
                break;
            case 'person':
                disbursement = this.personRepository.create({
                    ...createDisbursementDto,
                    branchID,
                });
                break;
            default:
                throw new ForbiddenException('Invalid disbursement type');
        }

        const saved = await this.disbursementRepository.save(disbursement);
        LoggerUtil.logDatabaseCall(`INSERT INTO disbursement`, 0, 'Disbursement');

        // Update loan status if it's the first disbursement or fully disbursed logic here
        // For now just update to disbursed if successfully created
        if (loan.status !== 'disbursed') {
            loan.status = 'disbursed';
            await this.loanRepository.save(loan);
        }

        return saved;
    }

    async updateDisbursement(
        id: number,
        updateDisbursementDto: UpdateDisbursementDto,
        branchID: number,
    ): Promise<Disbursement> {
        const disbursement = await this.disbursementRepository.findOne({
            where: { id, branchID },
        });

        if (!disbursement) {
            throw new NotFoundException(`Disbursement with ID ${id} not found`);
        }

        Object.assign(disbursement, updateDisbursementDto);
        const saved = await this.disbursementRepository.save(disbursement);
        LoggerUtil.logDatabaseCall(`UPDATE disbursement SET ...`, 0, 'Disbursement');
        return saved;
    }

    async getDisbursement(id: number, branchID: number): Promise<Disbursement> {
        const disbursement = await this.disbursementRepository.findOne({
            where: { id, branchID },
            relations: ['loan', 'loan.client'],
        });

        if (!disbursement) {
            throw new NotFoundException(`Disbursement with ID ${id} not found`);
        }

        return disbursement;
    }

    async getDisbursements(pagination: PaginationQueryWithBranchDto) {
        const { page = 1, pageSize = 20, branchId } = pagination;
        const skip = (page - 1) * pageSize;

        const [data, total] = await this.disbursementRepository.findAndCount({
            where: { branchID: branchId },
            relations: ['loan', 'loan.client'],
            skip,
            take: pageSize,
            order: { date: 'DESC' },
        });

        return {
            data,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }

    async deleteDisbursement(id: number, branchID: number): Promise<void> {
        const result = await this.disbursementRepository.delete({ id, branchID });
        if (result.affected === 0) {
            throw new NotFoundException(`Disbursement with ID ${id} not found`);
        }
        LoggerUtil.logDatabaseCall(`DELETE FROM disbursement`, 0, 'Disbursement');
    }
}
