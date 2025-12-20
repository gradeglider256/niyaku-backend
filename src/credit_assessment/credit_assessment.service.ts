import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EmploymentHistory } from './entities/employment.entity';
import { SalaryHistory } from './entities/salary.entity';
import { CompanyEarnings } from './entities/company-earnings.entity';
import { AssessmentReport, AssessmentStatus } from './entities/assessment-report.entity';
import { Client, ClientType } from '../clients/entities/client.entity';
import { Repayment } from '../repayment/entity/repayment.entity';
import { CreateEmploymentHistoryDto, CreateSalaryHistoryDto, CreateCompanyEarningsDto, CreateAssessmentRequestDto } from './dto/credit-assessment.dto';
import { LoggerUtil } from '../common/utils/logger.util';
import { PaginationQueryWithBranchDto } from '../common/dtos/pagination.dtos';

@Injectable()
export class CreditAssessmentService {
    constructor(
        @InjectRepository(EmploymentHistory)
        private employmentRepository: Repository<EmploymentHistory>,
        @InjectRepository(SalaryHistory)
        private salaryRepository: Repository<SalaryHistory>,
        @InjectRepository(CompanyEarnings)
        private earningsRepository: Repository<CompanyEarnings>,
        @InjectRepository(AssessmentReport)
        private assessmentRepository: Repository<AssessmentReport>,
        @InjectRepository(Client)
        private clientRepository: Repository<Client>,
        @InjectRepository(Repayment)
        private repaymentRepository: Repository<Repayment>,
        private dataSource: DataSource,
    ) { }

    async createEmploymentHistory(dto: CreateEmploymentHistoryDto, branchID: number) {
        const history = this.employmentRepository.create({
            ...dto,
            branchID,
        });
        const saved = await this.employmentRepository.save(history);
        LoggerUtil.logDatabaseCall(`INSERT INTO employment_history`, 0, 'CreditAssessment');
        return saved;
    }

    async createSalaryHistory(dto: CreateSalaryHistoryDto) {
        const employment = await this.employmentRepository.findOne({ where: { id: dto.employmentHistoryID } });
        if (!employment) throw new NotFoundException('Employment history not found');

        const netSalary = dto.baseSalary + (dto.allowances || 0) - (dto.deductions || 0);
        const history = this.salaryRepository.create({
            ...dto,
            netSalary,
        });
        const saved = await this.salaryRepository.save(history);
        LoggerUtil.logDatabaseCall(`INSERT INTO salary_history`, 0, 'CreditAssessment');
        return saved;
    }

    async createCompanyEarnings(dto: CreateCompanyEarningsDto) {
        const earnings = this.earningsRepository.create(dto);
        const saved = await this.earningsRepository.save(earnings);
        LoggerUtil.logDatabaseCall(`INSERT INTO company_earnings`, 0, 'CreditAssessment');
        return saved;
    }

    async performAssessment(dto: CreateAssessmentRequestDto, branchID: number, officerID?: string) {
        const client = await this.clientRepository.findOne({ where: { id: dto.clientID } });
        if (!client) throw new NotFoundException('Client not found');

        // 1. Calculate Average Income
        let avgMonthlyIncome = 0;
        if (client.type === ClientType.INDIVIDUAL) {
            const salaries = await this.salaryRepository.find({
                where: { employment: { clientID: client.id } },
                order: { year: 'DESC', month: 'DESC' },
                take: 6,
            });
            if (salaries.length > 0) {
                avgMonthlyIncome = salaries.reduce((acc, s) => acc + Number(s.netSalary), 0) / salaries.length;
            }
        } else {
            const earnings = await this.earningsRepository.find({
                where: { clientID: client.id },
                order: { financialYear: 'DESC' },
                take: 3,
            });
            if (earnings.length > 0) {
                avgMonthlyIncome = earnings.reduce((acc, e) => acc + Number(e.monthlyEarning), 0) / earnings.length;
            }
        }

        // 2. Assess Repayment History
        const repayments = await this.repaymentRepository.find({ where: { clientID: client.id } });
        const overdueCount = repayments.filter(r => r.status === 'overdue').length;
        const paidOnTime = repayments.filter(r => r.status === 'paid').length;

        // 3. Simple Scoring Logic
        let score = 50; // Base score
        if (avgMonthlyIncome > 5000) score += 20;
        else if (avgMonthlyIncome > 2000) score += 10;

        if (overdueCount === 0 && repayments.length > 0) score += 20;
        if (overdueCount > 2) score -= 30;

        if (dto.crbScore) {
            if (dto.crbScore > 700) score += 20;
            else if (dto.crbScore < 400) score -= 20;
        }

        // 4. Determine Risk Rating and Limit
        let riskRating = 'High';
        let status = AssessmentStatus.REJECTED;
        let recommendedLimit = 0;

        if (score >= 80) {
            riskRating = 'Low';
            status = AssessmentStatus.APPROVED;
            recommendedLimit = avgMonthlyIncome * 3;
        } else if (score >= 50) {
            riskRating = 'Medium';
            status = AssessmentStatus.PENDING;
            recommendedLimit = avgMonthlyIncome * 1.5;
        }

        const report = this.assessmentRepository.create({
            clientID: client.id,
            branchID,
            riskRating,
            recommendedLimit,
            status,
            crbScore: dto.crbScore,
            liabilities: dto.liabilities,
            findings: dto.findings || `Automated score: ${score}`,
            officerID,
        });

        const saved = await this.assessmentRepository.save(report);
        LoggerUtil.logDatabaseCall(`INSERT INTO assessment_report`, 0, 'CreditAssessment');
        return saved;
    }

    async getAssessmentHistory(pagination: PaginationQueryWithBranchDto) {
        const { page = 1, pageSize = 20, branchId } = pagination;
        const skip = (page - 1) * pageSize;

        const [data, total] = await this.assessmentRepository.findAndCount({
            where: branchId ? { branchID: branchId } : {},
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

    async getAssessmentById(id: string) {
        const report = await this.assessmentRepository.findOne({
            where: { id },
            relations: ['client', 'officer'],
        });
        if (!report) throw new NotFoundException('Assessment report not found');
        return report;
    }
}
