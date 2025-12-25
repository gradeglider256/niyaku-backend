import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  ConfirmDisbursementDto,
} from './dto/disbursement.dto';
import { Repayment } from '../repayment/entity/repayment.entity';
import { DocumentsService } from '../documents/documents.service';
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
    @InjectRepository(Repayment)
    private repaymentRepository: Repository<Repayment>,
    private documentsService: DocumentsService,
  ) { }

  // --- Loan Operations ---

  async createLoan(
    createLoanDto: CreateLoanDto,
    branchID: number,
  ): Promise<Loan> {
    const emi = this.calculateEMI(
      createLoanDto.amount,
      createLoanDto.tenure,
      createLoanDto.interestRate,
      createLoanDto.processingFee,
    );

    const totalInterest =
      Number(createLoanDto.amount) *
      (Number(createLoanDto.interestRate) / 100) *
      (createLoanDto.tenure / 12);
    const balance =
      Number(createLoanDto.amount) +
      totalInterest +
      Number(createLoanDto.processingFee);

    const loan = this.loanRepository.create({
      ...createLoanDto,
      branchID,
      status: 'pending',
      emi,
      balance,
    });
    const saved = await this.loanRepository.save(loan);
    LoggerUtil.logDatabaseCall(`INSERT INTO loan`, 0, 'Disbursement');
    return saved;
  }

  async updateLoan(
    id: number,
    updateLoanDto: UpdateLoanDto,
    branchID: number,
  ): Promise<Loan> {
    const loan = await this.loanRepository.findOne({ where: { id, branchID } });
    if (!loan) {
      throw new NotFoundException(
        `Loan with ID ${id} not found in your branch`,
      );
    }

    Object.assign(loan, updateLoanDto);

    // Recalculate EMI if any relevant fields are updated
    loan.emi = this.calculateEMI(
      loan.amount,
      loan.tenure,
      loan.interestRate,
      loan.processingFee,
    );

    const saved = await this.loanRepository.save(loan);
    LoggerUtil.logDatabaseCall(`UPDATE loan SET ...`, 0, 'Disbursement');
    return saved;
  }

  async getLoan(id: number, branchID: number): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id, branchID },
      relations: ['client', 'branch', 'disbursements'],
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
      relations: ['client', 'disbursements'],
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
    const status = createDisbursementDto.status || 'pending';

    return await this.loanRepository.manager.transaction(async (manager) => {
      // Verify loan exists and is in the same branch
      const loan = await manager.findOne(Loan, {
        where: { id: createDisbursementDto.loanID, branchID },
      });

      if (!loan) {
        throw new NotFoundException(
          `Loan with ID ${createDisbursementDto.loanID} not found in your branch`,
        );
      }

      if (loan.status !== 'approved') {
        throw new BadRequestException(
          `Only approved loans can be disbursed. Current status: ${loan.status}`,
        );
      }

      // Enforce Single Disbursement Rule:
      // If a disbursement already exists:
      // - If finalized (disbursed), reject.
      // - If pending, remove it so the new one can replace it (handles type changes).
      const existingDisbursement = await manager.findOne(Disbursement, {
        where: { loanID: createDisbursementDto.loanID },
      });

      if (existingDisbursement) {
        if (existingDisbursement.status === 'disbursed') {
          throw new BadRequestException(
            'A disbursement has already been finalized for this loan.',
          );
        }
        // Remove the pending one to replace it
        await manager.delete(Disbursement, { id: existingDisbursement.id });
        LoggerUtil.logDatabaseCall(`DELETE FROM disbursement (replacing pending)`, 0, 'Disbursement');
      }

      let disbursement: Disbursement;

      switch (createDisbursementDto.type) {
        case 'mobile':
          if (status === 'disbursed' && !createDisbursementDto.transactionID) {
            throw new BadRequestException('Transaction ID is required for mobile disbursement');
          }
          disbursement = manager.create(MobileMoneyDisbursement, {
            ...createDisbursementDto,
            branchID,
            status,
          });
          break;
        case 'bank':
          disbursement = manager.create(BankDisbursement, {
            ...createDisbursementDto,
            branchID,
            status,
          });
          break;
        case 'person':
          disbursement = manager.create(PersonDisbursement, {
            ...createDisbursementDto,
            branchID,
            status,
          });
          break;
        default:
          throw new ForbiddenException('Invalid disbursement type');
      }

      const saved = await manager.save(disbursement);
      LoggerUtil.logDatabaseCall(`INSERT INTO disbursement`, 0, 'Disbursement');

      // Handle document upload for 'person' type if status is disbursed
      if (createDisbursementDto.type === 'person' && status === 'disbursed') {
        if (!createDisbursementDto.document) {
          throw new BadRequestException(
            'Document upload is required for in-person disbursements when finalising',
          );
        }

        const doc = await this.documentsService.saveDocument(
          createDisbursementDto.document.base64Content,
          createDisbursementDto.document.originalName,
          createDisbursementDto.document.mimeType,
        );

        (saved as PersonDisbursement).signedDocumentID = doc.id;
        await manager.save(PersonDisbursement, saved as PersonDisbursement);
      }

      // Only complete the disbursement if status is 'disbursed'
      if (status === 'disbursed') {
        await this.finalizeDisbursement(manager, loan, saved);
      }

      return saved;
    });
  }

  async confirmDisbursement(
    id: number,
    confirmDto: ConfirmDisbursementDto,
    branchID: number,
  ): Promise<Disbursement> {
    return await this.loanRepository.manager.transaction(async (manager) => {
      const disbursement = await manager.findOne(Disbursement, {
        where: { id, branchID },
        relations: ['loan'],
      });

      if (!disbursement) {
        throw new NotFoundException(`Disbursement with ID ${id} not found`);
      }

      if (disbursement.status === 'disbursed') {
        throw new BadRequestException('Disbursement is already finalized');
      }

      // Update fields from confirmDto
      Object.assign(disbursement, confirmDto);

      // Save document if provided for person type
      if (disbursement.type === 'person') {
        if (!confirmDto.document && !(disbursement as PersonDisbursement).signedDocumentID) {
          throw new BadRequestException('Document upload is required to finalize in-person disbursement');
        }

        if (confirmDto.document) {
          const doc = await this.documentsService.saveDocument(
            confirmDto.document.base64Content,
            confirmDto.document.originalName,
            confirmDto.document.mimeType,
          );
          (disbursement as PersonDisbursement).signedDocumentID = doc.id;
        }
      }

      // Mobile validation
      if (disbursement.type === 'mobile' && !disbursement['transactionID']) {
        throw new BadRequestException('Transaction ID is required to finalize mobile disbursement');
      }

      disbursement.status = 'disbursed';
      const saved = await manager.save(disbursement);

      await this.finalizeDisbursement(manager, disbursement.loan, saved);

      return saved;
    });
  }

  private async finalizeDisbursement(manager: any, loan: Loan, disbursement: Disbursement) {
    // Update loan status to disbursed
    loan.status = 'disbursed';
    await manager.save(Loan, loan);

    // Generate first repayment record (1 month from now)
    const repaymentDate = new Date();
    repaymentDate.setMonth(repaymentDate.getMonth() + 1);

    const totalInterest =
      Number(loan.amount) * (Number(loan.interestRate) / 100) * (loan.tenure / 12);
    const monthlyInterest = Number((totalInterest / loan.tenure).toFixed(2));

    const repayment = manager.create(Repayment, {
      loanID: loan.id,
      clientID: loan.clientID,
      branchID: loan.branchID,
      amount: loan.emi,
      interest: monthlyInterest,
      dateToBePaid: repaymentDate.toISOString().split('T')[0],
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await manager.save(Repayment, repayment);
    LoggerUtil.logDatabaseCall(`INSERT INTO repayment`, 0, 'Disbursement');
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
    LoggerUtil.logDatabaseCall(
      `UPDATE disbursement SET ...`,
      0,
      'Disbursement',
    );
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

  private calculateEMI(
    amount: number,
    tenure: number,
    interestRate: number,
    processingFee: number,
  ): number {
    const principal = Number(amount);
    const rate = Number(interestRate);
    const months = Number(tenure);
    const fee = Number(processingFee);

    // Interest = Principal * (Rate/100) * (Tenure/12)
    const totalInterest = principal * (rate / 100) * (months / 12);
    const totalRepayable = principal + totalInterest + fee;

    // EMI = Total Repayable / Tenure
    return Number((totalRepayable / months).toFixed(2));
  }
}
