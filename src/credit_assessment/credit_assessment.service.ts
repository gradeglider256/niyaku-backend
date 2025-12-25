import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { EmploymentHistory } from './entities/employment.entity';
import { SalaryHistory } from './entities/salary.entity';
import { CompanyEarnings } from './entities/company-earnings.entity';
import {
  AssessmentReport,
  AssessmentStatus,
} from './entities/assessment-report.entity';
import { Client, ClientType } from '../clients/entities/client.entity';
import { Repayment } from '../repayment/entity/repayment.entity';
import { Loan } from '../disbursement/entities/loan.entity';
import {
  CreateEmploymentHistoryDto,
  CreateSalaryHistoryDto,
  CreateCompanyEarningsDto,
} from './dto/credit-assessment.dto';
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

  async createEmploymentHistory(
    dto: CreateEmploymentHistoryDto,
    branchID: number,
  ) {
    const startTime = Date.now(); // Start performance timer

    return await this.dataSource.transaction(async (manager) => {
      // 1. Create and Save Employment History without using this.employmentRepository
      const employment = manager.create(EmploymentHistory, {
        clientID: dto.clientID,
        employerName: dto.employerName,
        industry: dto.industry,
        position: dto.position,
        contractType: dto.contractType,
        contractDuration: dto.contractDuration,
        startDate: dto.startDate,
        endDate: dto.endDate,
        status: dto.status,
        branchID,
      });

      const savedEmployment = await manager.save(EmploymentHistory, employment);

      // 2. Create and Save multiple Salary records
      if (dto.salaries && dto.salaries.length > 0) {
        const salaryRecords = dto.salaries.map((salaryDto) => {
          return manager.create(SalaryHistory, {
            ...salaryDto,
            employmentHistoryID: savedEmployment.id,
            isVerified: false,
          });
        });

        await manager.save(SalaryHistory, salaryRecords);
      }

      // Calculate execution time
      const duration = Date.now() - startTime;

      LoggerUtil.logDatabaseCall(
        `TRANSACTION: Employment & ${dto.salaries?.length || 0} Salaries`,
        duration,
        'CreditAssessment',
      );

      return {
        ...savedEmployment,
        salaries: dto.salaries,
      };
    });
  }

  async createSalaryHistory(dto: CreateSalaryHistoryDto) {
    const employment = await this.employmentRepository.findOne({
      where: { id: dto.employmentHistoryID },
    });
    if (!employment)
      throw new NotFoundException('Employment history not found');

    const history = this.salaryRepository.create({
      ...dto,
    });
    const saved = await this.salaryRepository.save(history);
    LoggerUtil.logDatabaseCall(
      `INSERT INTO salary_history`,
      0,
      'CreditAssessment',
    );
    return saved;
  }

  async createCompanyEarnings(dto: CreateCompanyEarningsDto) {
    const earnings = this.earningsRepository.create(dto);
    const saved = await this.earningsRepository.save(earnings);
    LoggerUtil.logDatabaseCall(
      `INSERT INTO company_earnings`,
      0,
      'CreditAssessment',
    );
    return saved;
  }

  async performAssessment(
    clientID: string,
    branchID: number,
    officerID?: string,
  ) {
    const startTime = Date.now();

    return await this.dataSource.transaction(async (manager) => {
      // Use manager instead of repositories
      const client = await manager.findOne(Client, {
        where: { id: clientID },
      });
      if (!client) throw new NotFoundException('Client not found');

      // 1. Calculate Average Income
      let avgMonthlyIncome = 0;
      if (client.type === ClientType.INDIVIDUAL) {
        const salaries = await manager.find(SalaryHistory, {
          where: { employment: { clientID: client.id } },
          order: { year: 'DESC', createdAt: 'DESC' },
          take: 6,
        });

        if (salaries.length > 0) {
          avgMonthlyIncome =
            salaries.reduce((acc, s) => {
              const net =
                Number(s.baseSalary) +
                Number(s.allowances) -
                Number(s.deductions);
              return acc + net;
            }, 0) / salaries.length;
        }
      } else {
        const earnings = await manager.find(CompanyEarnings, {
          where: { clientID: client.id },
          order: { financialYear: 'DESC' },
          take: 3,
        });
        if (earnings.length > 0) {
          avgMonthlyIncome =
            earnings.reduce((acc, e) => acc + Number(e.monthlyEarning), 0) /
            earnings.length;
        }
      }

      // 2. Assess Repayment History
      const repayments = await manager.find(Repayment, {
        where: { clientID: client.id },
      });
      const overdueCount = repayments.filter(
        (r) => r.status === 'overdue',
      ).length;

      // 3. Calculate Liabilities (Sum of active loans)
      // Note: In a real system, we'd fetch actual outstanding balances
      const loans = await manager.find(Loan, {
        where: { clientID: client.id, status: In(['approved', 'disbursed']) },
      });
      const totalLiabilities = loans.reduce((acc, l) => acc + Number(l.amount), 0);

      // 4. Hardcoded CRB Score (Mid-range as requested)
      const crbScore = 500;

      // 5. Scoring Logic
      let score = 50;
      if (avgMonthlyIncome > 5000000) score += 20;
      else if (avgMonthlyIncome > 2000000) score += 10;

      if (overdueCount === 0 && repayments.length > 0) score += 20;
      if (overdueCount > 2) score -= 30;

      if (crbScore > 700) score += 20;
      else if (crbScore < 400) score -= 20;

      // Deduct for high liabilities relative to income
      if (totalLiabilities > avgMonthlyIncome * 5) score -= 10;

      // 6. Determine Risk Rating and Limit
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

      // 7. Generate Findings
      const findings = `Automated assessment for ${client.type} client. 
Score: ${score}/100. 
Avg Monthly Income: ${avgMonthlyIncome.toLocaleString()}. 
Total Active Liabilities: ${totalLiabilities.toLocaleString()}. 
Repayment Overdue Count: ${overdueCount}. 
Note: CRB score (500) used as placeholder.`;

      // 8. Save Report
      const report = manager.create(AssessmentReport, {
        clientID: client.id,
        branchID,
        riskRating,
        recommendedLimit,
        status,
        crbScore,
        liabilities: { total: totalLiabilities, activeLoanCount: loans.length },
        findings,
        officerID,
      });

      const saved = await manager.save(AssessmentReport, report);

      const duration = Date.now() - startTime;
      LoggerUtil.logDatabaseCall(
        `ASSESSMENT_PERFORMED for Client: ${client.id}`,
        duration,
        'CreditAssessment',
      );

      return saved;
    });
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
