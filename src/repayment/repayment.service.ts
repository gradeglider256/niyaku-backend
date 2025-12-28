/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Repayment } from './entity/repayment.entity';
import { Loan } from '../disbursement/entities/loan.entity';
import { Payment } from './entity/payment.entity';
import { CreateRepaymentDto } from './dto/create-repayment.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
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
  ) {}

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

    // Build the query with calculated fields
    const queryBuilder = this.repaymentRepository
      .createQueryBuilder('repayment')
      .leftJoinAndSelect('repayment.client', 'client')
      .leftJoinAndSelect('repayment.loan', 'loan')
      .leftJoin('repayment.payments', 'payment')
      .select([
        'repayment.id',
        'repayment.clientID',
        'repayment.loanID',
        'repayment.branchID',
        'repayment.amount',
        'repayment.dateToBePaid',
        'repayment.datePaid',
        'repayment.status',
        'repayment.createdAt',
        'repayment.updatedAt',
      ])
      // Client fields - include all fields from base and child entities
      .addSelect('client.id')
      .addSelect('client.type')
      .addSelect('client.branchID')
      .addSelect('client.createdAt')
      .addSelect('client.updatedAt')
      // Individual client fields
      .addSelect('client.firstName')
      .addSelect('client.lastName')
      .addSelect('client.middleName')
      .addSelect('client.nin')
      // Business client fields
      .addSelect('client.businessName')
      .addSelect('client.registrationNumber')
      .addSelect('client.businessType')
      // Loan fields
      .addSelect('loan.id')
      .addSelect('loan.amount')
      .addSelect('loan.balance')
      .addSelect('loan.status')
      // Calculated fields
      .addSelect('COUNT(payment.id)', 'paymentCount')
      .addSelect('COALESCE(SUM(payment.amountPaid), 0)', 'totalPaid')
      .addSelect(
        'CAST(repayment.amount AS DECIMAL(12,2)) - COALESCE(SUM(payment.amountPaid), 0)',
        'remainingBalance',
      )
      .groupBy('repayment.id')
      .addGroupBy('client.id')
      .addGroupBy('loan.id');

    // Add branch filter if provided
    if (branchId) {
      queryBuilder.where('repayment.branchID = :branchId', { branchId });
    }

    // Get total count (before pagination)
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    const rawResults = await queryBuilder
      .orderBy('repayment.createdAt', 'DESC')
      .offset(skip)
      .limit(pageSize)
      .getRawAndEntities();

    // Map the calculated fields to the entities
    const data = rawResults.entities.map((entity, index) => {
      const raw = rawResults.raw[index];
      return {
        ...entity,
        paymentCount: parseInt(raw.paymentCount) || 0,
        totalPaid: parseFloat(raw.totalPaid) || 0,
        remainingBalance: parseFloat(raw.remainingBalance) || 0,
      };
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

  async addPayment(
    repaymentId: number,
    dto: CreatePaymentDto,
    branchID: number,
  ) {
    return this.repaymentRepository.manager.transaction(async (manager) => {
      // 1. Load repayment WITHOUT payments
      const repayment = await manager.findOne(Repayment, {
        where: { id: repaymentId, branchID },
        relations: ['loan'], // ⛔ DO NOT load payments
      });

      if (!repayment) {
        throw new NotFoundException(
          `Repayment with ID ${repaymentId} not found`,
        );
      }

      if (repayment.status === 'paid') {
        throw new BadRequestException('Repayment is already fully paid');
      }

      // 2. Create payment USING RELATION (not repaymentID)
      const payment = manager.create(Payment, {
        repayment: { id: repayment.id },
        amountPaid: dto.amountPaid,
        paymentMethod: dto.paymentMethod,
        paymentDate: dto.paymentDate,
        createdAt: new Date().toISOString(),
      });

      await manager.save(Payment, payment);

      // 3. Recalculate Total Paid for THIS repayment
      const { totalPaidForRepayment } = await manager
        .createQueryBuilder(Payment, 'p')
        .select('COALESCE(SUM(p.amountPaid), 0)', 'totalPaidForRepayment')
        .where('p.repaymentID = :repaymentId', { repaymentId })
        .getRawOne();

      const currentTotalPaid = Number(totalPaidForRepayment);
      const repaymentAmount = Number(repayment.amount);

      // ✅ CHANGE 1: Repayment amount stays the same, only status changes
      const isPaid = currentTotalPaid >= repaymentAmount;
      const datePaid = isPaid
        ? new Date().toISOString().split('T')[0]
        : undefined;

      await manager.update(
        Repayment,
        { id: repayment.id },
        {
          status: isPaid ? 'paid' : 'pending',
          datePaid,
          // Note: amount field is NOT updated - it remains the original EMI
        },
      );

      // 4. Calculate TOTAL payments made across ALL repayments for this loan
      const { totalPaidForLoan } = await manager
        .createQueryBuilder(Payment, 'p')
        .innerJoin('p.repayment', 'r')
        .select('COALESCE(SUM(p.amountPaid), 0)', 'totalPaidForLoan')
        .where('r.loanID = :loanId', { loanId: repayment.loan.id })
        .getRawOne();

      const totalAmountPaidForLoan = Number(totalPaidForLoan);
      const loan = repayment.loan;
      const totalInterest =
        Number(loan.amount) *
        (Number(loan.interestRate) / 100) *
        (loan.tenure / 12);
      const originalLoanAmount =
        Number(loan.amount) + totalInterest + Number(loan.processingFee);

      // ✅ Calculate true remaining balance based on original loan amount
      const newLoanBalance = originalLoanAmount - totalAmountPaidForLoan; // this calculation is incomplete since we need the calculation to include the interest and the processing fee as well

      await manager.update(
        Loan,
        { id: loan.id },
        {
          balance: newLoanBalance > 0 ? newLoanBalance : 0,
          status: newLoanBalance <= 0 ? 'fully_paid' : loan.status,
        },
      );

      // 5. Generate next repayment if needed
      if (isPaid && newLoanBalance > 0) {
        // Count how many repayments have been fully paid
        const paidCount = await manager.count(Repayment, {
          where: { loanID: loan.id, status: 'paid' },
        });

        const remainingMonths = loan.tenure - paidCount;

        // ✅ CHANGE 2: Calculate next EMI based on TRUE remaining balance
        // This accounts for overpayments automatically
        const nextAmount =
          remainingMonths > 0
            ? Math.round((newLoanBalance / remainingMonths) * 100) / 100
            : newLoanBalance;

        const nextRepaymentDate = new Date(repayment.dateToBePaid);
        nextRepaymentDate.setMonth(nextRepaymentDate.getMonth() + 1);

        const nextRepayment = manager.create(Repayment, {
          loanID: loan.id,
          clientID: loan.clientID,
          branchID: loan.branchID,
          amount: nextAmount, // ✅ Dynamically calculated EMI
          dateToBePaid: nextRepaymentDate.toISOString().split('T')[0],
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        await manager.save(Repayment, nextRepayment);
      }

      return { repaymentId: repayment.id, payment };
    });
  }
}
