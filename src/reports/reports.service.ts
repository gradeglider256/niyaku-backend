import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from '../disbursement/entities/loan.entity';
import { Repayment } from '../repayment/entity/repayment.entity';
import { Disbursement } from '../disbursement/entities/disemburse.entity';
import { DashboardResponse } from './dto/dashboard.dto';
import { AnalyticsResponse } from './dto/analytics.dto';

@Injectable()
export class ReportsService {
    private readonly logger = new Logger(ReportsService.name);

    constructor(
        @InjectRepository(Loan)
        private loanRepository: Repository<Loan>,
        @InjectRepository(Repayment)
        private repaymentRepository: Repository<Repayment>,
        @InjectRepository(Disbursement)
        private disbursementRepository: Repository<Disbursement>,
    ) { }

    async getDashboardData(
        startDate?: Date,
        endDate?: Date,
    ): Promise<DashboardResponse> {
        try {
            // Default to last 6 months if no date range provided
            const end = endDate || new Date();
            const start =
                startDate ||
                new Date(end.getFullYear(), end.getMonth() - 5, 1); // 6 months ago

            this.logger.log(
                `Fetching dashboard data from ${start.toISOString()} to ${end.toISOString()}`,
            );

            // Fetch all data in parallel
            const [
                metrics,
                disbursementsVsRepayments,
                loanStatusDistribution,
                monthlyTrends,
            ] = await Promise.all([
                this.getMetrics(),
                this.getDisbursementsVsRepayments(start, end),
                this.getLoanStatusDistribution(),
                this.getMonthlyTrends(start, end),
            ]);

            return {
                metrics,
                disbursementsVsRepayments,
                loanStatusDistribution,
                monthlyTrends,
            };
        } catch (error) {
            this.logger.error('Error fetching dashboard data:', error);
            throw error;
        }
    }

    private async getMetrics() {
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1,
        );
        const previousMonthEnd = new Date(
            now.getFullYear(),
            now.getMonth(),
            0,
            23,
            59,
            59,
        );

        // Current month metrics
        const currentTotalLoans = await this.loanRepository
            .createQueryBuilder('loan')
            .select('COALESCE(SUM(loan.amount), 0)', 'total')
            .addSelect('COUNT(loan.id)', 'count')
            .where('loan.createdAt >= :currentMonthStart', { currentMonthStart })
            .getRawOne();

        const currentPendingApprovals = await this.loanRepository
            .createQueryBuilder('loan')
            .where('loan.status = :status', { status: 'pending' })
            .andWhere('loan.createdAt >= :currentMonthStart', { currentMonthStart })
            .getCount();

        const currentOverdueRepayments = await this.repaymentRepository.count({
            where: { status: 'overdue' },
        });

        const currentActiveLoans = await this.loanRepository.count({
            where: { status: 'disbursed' },
        });

        // Previous month metrics
        const previousTotalLoans = await this.loanRepository
            .createQueryBuilder('loan')
            .select('COALESCE(SUM(loan.amount), 0)', 'total')
            .addSelect('COUNT(loan.id)', 'count')
            .where('loan.createdAt >= :previousMonthStart', { previousMonthStart })
            .andWhere('loan.createdAt <= :previousMonthEnd', { previousMonthEnd })
            .getRawOne();

        const previousPendingApprovals = await this.loanRepository
            .createQueryBuilder('loan')
            .where('loan.status = :status', { status: 'pending' })
            .andWhere('loan.createdAt >= :previousMonthStart', { previousMonthStart })
            .andWhere('loan.createdAt <= :previousMonthEnd', { previousMonthEnd })
            .getCount();

        const previousOverdueRepayments = await this.repaymentRepository
            .createQueryBuilder('repayment')
            .where('repayment.status = :status', { status: 'overdue' })
            .andWhere('repayment.createdAt >= :previousMonthStart', {
                previousMonthStart,
            })
            .andWhere('repayment.createdAt <= :previousMonthEnd', {
                previousMonthEnd,
            })
            .getCount();

        const previousActiveLoans = await this.loanRepository
            .createQueryBuilder('loan')
            .where('loan.status = :status', { status: 'disbursed' })
            .andWhere('loan.createdAt >= :previousMonthStart', { previousMonthStart })
            .andWhere('loan.createdAt <= :previousMonthEnd', { previousMonthEnd })
            .getCount();

        // Calculate percentage changes
        const calculatePercentageChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        return {
            totalLoans: {
                amount: parseFloat(currentTotalLoans.total) || 0,
                count: parseInt(currentTotalLoans.count) || 0,
                percentageChange: calculatePercentageChange(
                    parseFloat(currentTotalLoans.total) || 0,
                    parseFloat(previousTotalLoans.total) || 0,
                ),
            },
            pendingApprovals: {
                count: currentPendingApprovals,
                percentageChange: calculatePercentageChange(
                    currentPendingApprovals,
                    previousPendingApprovals,
                ),
            },
            overdueRepayments: {
                count: currentOverdueRepayments,
                percentageChange: calculatePercentageChange(
                    currentOverdueRepayments,
                    previousOverdueRepayments,
                ),
            },
            activeLoans: {
                count: currentActiveLoans,
                percentageChange: calculatePercentageChange(
                    currentActiveLoans,
                    previousActiveLoans,
                ),
            },
        };
    }

    private async getDisbursementsVsRepayments(startDate: Date, endDate: Date) {
        // Get disbursements grouped by month
        const disbursements = await this.disbursementRepository
            .createQueryBuilder('disbursement')
            .leftJoin('disbursement.loan', 'loan')
            .select("TO_CHAR(disbursement.date, 'Mon')", 'month')
            .addSelect('COALESCE(SUM(loan.amount), 0)', 'total')
            .where('disbursement.date >= :startDate', { startDate })
            .andWhere('disbursement.date <= :endDate', { endDate })
            .andWhere('disbursement.status = :status', { status: 'disbursed' })
            .groupBy("TO_CHAR(disbursement.date, 'Mon')")
            .addGroupBy("TO_CHAR(disbursement.date, 'YYYY-MM')")
            .orderBy("TO_CHAR(disbursement.date, 'YYYY-MM')", 'ASC')
            .getRawMany();

        // Get repayments grouped by month
        const repayments = await this.repaymentRepository
            .createQueryBuilder('repayment')
            .leftJoin('repayment.payments', 'payment')
            .select('TO_CHAR("payment"."paymentDate"::date, \'Mon\')', 'month')
            .addSelect('COALESCE(SUM("payment"."amountPaid"), 0)', 'total')
            .where('"payment"."paymentDate" >= :startDate', { startDate })
            .andWhere('"payment"."paymentDate" <= :endDate', { endDate })
            .groupBy('TO_CHAR("payment"."paymentDate"::date, \'Mon\')')
            .addGroupBy('TO_CHAR("payment"."paymentDate"::date, \'YYYY-MM\')')
            .orderBy('TO_CHAR("payment"."paymentDate"::date, \'YYYY-MM\')', 'ASC')
            .getRawMany();

        // Merge the data by month
        const monthMap = new Map<string, { disbursed: number; repaid: number }>();

        disbursements.forEach((d) => {
            monthMap.set(d.month, {
                disbursed: parseFloat(d.total) || 0,
                repaid: 0,
            });
        });

        repayments.forEach((r) => {
            const existing = monthMap.get(r.month) || { disbursed: 0, repaid: 0 };
            monthMap.set(r.month, {
                ...existing,
                repaid: parseFloat(r.total) || 0,
            });
        });

        return Array.from(monthMap.entries()).map(([month, data]) => ({
            month: month.charAt(0).toUpperCase() + month.slice(1).toLowerCase(),
            disbursed: data.disbursed,
            repaid: data.repaid,
        }));
    }

    private async getLoanStatusDistribution() {
        const statusCounts = await this.loanRepository
            .createQueryBuilder('loan')
            .select('loan.status', 'status')
            .addSelect('COUNT(loan.id)', 'count')
            .groupBy('loan.status')
            .getRawMany();

        const distribution = {
            approved: 0,
            pending: 0,
            rejected: 0,
            disbursed: 0,
            fullyPaid: 0,
        };

        statusCounts.forEach((item) => {
            const count = parseInt(item.count) || 0;
            switch (item.status) {
                case 'approved':
                    distribution.approved = count;
                    break;
                case 'pending':
                    distribution.pending = count;
                    break;
                case 'rejected':
                    distribution.rejected = count;
                    break;
                case 'disbursed':
                    distribution.disbursed = count;
                    break;
                case 'fully_paid':
                    distribution.fullyPaid = count;
                    break;
            }
        });

        return distribution;
    }

    private async getMonthlyTrends(startDate: Date, endDate: Date) {
        // For trends, we'll use the same data as disbursements vs repayments
        return this.getDisbursementsVsRepayments(startDate, endDate);
    }

    async getAnalyticsData(
        startDate?: Date,
        endDate?: Date,
    ): Promise<AnalyticsResponse> {
        try {
            // Default to year-to-date if no date range provided
            const end = endDate || new Date();
            const start = startDate || new Date(end.getFullYear(), 0, 1); // January 1

            this.logger.log(
                `Fetching analytics data from ${start.toISOString()} to ${end.toISOString()}`,
            );

            // Fetch all data in parallel
            const [metrics, monthlyLoanPerformance, collectionVsExpected] =
                await Promise.all([
                    this.getAnalyticsMetrics(start),
                    this.getMonthlyLoanPerformance(start, end),
                    this.getCollectionVsExpected(start, end),
                ]);

            return {
                metrics,
                monthlyLoanPerformance,
                collectionVsExpected,
            };
        } catch (error) {
            this.logger.error('Error fetching analytics data:', error);
            throw error;
        }
    }

    private async getAnalyticsMetrics(ytdStart: Date) {
        // Total Disbursed YTD
        const totalDisbursedResult = await this.disbursementRepository
            .createQueryBuilder('disbursement')
            .leftJoin('disbursement.loan', 'loan')
            .select('COALESCE(SUM("loan"."amount"), 0)', 'total')
            .where('"disbursement"."status" = :status', { status: 'disbursed' })
            .andWhere('"disbursement"."date" >= :ytdStart', { ytdStart })
            .getRawOne();

        const totalDisbursedYTD = parseFloat(totalDisbursedResult?.total) || 0;

        // Collection Rate Calculation
        const now = new Date();

        // Total Expected (repayments that were due up to now)
        const totalExpectedResult = await this.repaymentRepository
            .createQueryBuilder('repayment')
            .select('COALESCE(SUM("repayment"."amount"), 0)', 'total')
            .where('"repayment"."dateToBePaid" <= :now', { now })
            .getRawOne();

        const totalExpected = parseFloat(totalExpectedResult?.total) || 0;

        // Total Collected (actual payments made)
        const totalCollectedResult = await this.repaymentRepository
            .createQueryBuilder('repayment')
            .leftJoin('repayment.payments', 'payment')
            .select('COALESCE(SUM("payment"."amountPaid"), 0)', 'total')
            .where('"repayment"."dateToBePaid" <= :now', { now })
            .getRawOne();

        const totalCollected = parseFloat(totalCollectedResult?.total) || 0;

        // Calculate collection rate
        const collectionRate =
            totalExpected > 0
                ? Math.round((totalCollected / totalExpected) * 1000) / 10 // Round to 1 decimal
                : 0;

        // Default Rate Calculation
        const totalOverdue = await this.repaymentRepository.count({
            where: { status: 'overdue' },
        });

        const totalRepayments = await this.repaymentRepository.count();

        const defaultRate =
            totalRepayments > 0
                ? Math.round((totalOverdue / totalRepayments) * 1000) / 10 // Round to 1 decimal
                : 0;

        return {
            totalDisbursedYTD,
            collectionRate,
            defaultRate,
        };
    }

    private async getMonthlyLoanPerformance(startDate: Date, endDate: Date) {
        const results = await this.loanRepository
            .createQueryBuilder('loan')
            .select('TO_CHAR("loan"."createdAt", \'Mon\')', 'month')
            .addSelect('COUNT("loan"."id")', 'numberOfLoans')
            .addSelect('COALESCE(SUM("loan"."amount"), 0)', 'amountUGX')
            .where('"loan"."createdAt" >= :startDate', { startDate })
            .andWhere('"loan"."createdAt" <= :endDate', { endDate })
            .groupBy('TO_CHAR("loan"."createdAt", \'Mon\')')
            .addGroupBy('TO_CHAR("loan"."createdAt", \'YYYY-MM\')')
            .orderBy('TO_CHAR("loan"."createdAt", \'YYYY-MM\')', 'ASC')
            .getRawMany();

        return results.map((r) => ({
            month: r.month.charAt(0).toUpperCase() + r.month.slice(1).toLowerCase(),
            numberOfLoans: parseInt(r.numberOfLoans) || 0,
            amountUGX: parseFloat(r.amountUGX) || 0,
        }));
    }

    private async getCollectionVsExpected(startDate: Date, endDate: Date) {
        // Get expected amounts by month (based on dateToBePaid)
        const expectedResults = await this.repaymentRepository
            .createQueryBuilder('repayment')
            .select('TO_CHAR("repayment"."dateToBePaid"::date, \'Mon\')', 'month')
            .addSelect('COALESCE(SUM("repayment"."amount"), 0)', 'total')
            .where('"repayment"."dateToBePaid" >= :startDate', { startDate })
            .andWhere('"repayment"."dateToBePaid" <= :endDate', { endDate })
            .groupBy('TO_CHAR("repayment"."dateToBePaid"::date, \'Mon\')')
            .addGroupBy('TO_CHAR("repayment"."dateToBePaid"::date, \'YYYY-MM\')')
            .orderBy('TO_CHAR("repayment"."dateToBePaid"::date, \'YYYY-MM\')', 'ASC')
            .getRawMany();

        // Get collected amounts by month (based on paymentDate)
        const collectedResults = await this.repaymentRepository
            .createQueryBuilder('repayment')
            .leftJoin('repayment.payments', 'payment')
            .select('TO_CHAR("payment"."paymentDate"::date, \'Mon\')', 'month')
            .addSelect('COALESCE(SUM("payment"."amountPaid"), 0)', 'total')
            .where('"payment"."paymentDate" >= :startDate', { startDate })
            .andWhere('"payment"."paymentDate" <= :endDate', { endDate })
            .groupBy('TO_CHAR("payment"."paymentDate"::date, \'Mon\')')
            .addGroupBy('TO_CHAR("payment"."paymentDate"::date, \'YYYY-MM\')')
            .orderBy('TO_CHAR("payment"."paymentDate"::date, \'YYYY-MM\')', 'ASC')
            .getRawMany();

        // Merge the data by month
        const monthMap = new Map<string, { expected: number; collected: number }>();

        expectedResults.forEach((r) => {
            const month =
                r.month.charAt(0).toUpperCase() + r.month.slice(1).toLowerCase();
            monthMap.set(month, {
                expected: parseFloat(r.total) || 0,
                collected: 0,
            });
        });

        collectedResults.forEach((r) => {
            const month =
                r.month.charAt(0).toUpperCase() + r.month.slice(1).toLowerCase();
            const existing = monthMap.get(month) || { expected: 0, collected: 0 };
            monthMap.set(month, {
                ...existing,
                collected: parseFloat(r.total) || 0,
            });
        });

        return Array.from(monthMap.entries()).map(([month, data]) => ({
            month,
            expected: data.expected,
            collected: data.collected,
        }));
    }
}
