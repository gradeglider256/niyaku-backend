import {
  ChildEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
  UpdateDateColumn,
} from 'typeorm';
import { Loan } from './loan.entity';
import { Branch } from '../../user/entities/branch.entity';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Disbursement {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int' })
  loanID: number;

  @ManyToOne(() => Loan, (loan) => loan.disbursements)
  @JoinColumn({ name: 'loanID' })
  loan: Loan;

  @Column({ type: 'int' })
  branchID: number;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchID' })
  branch: Branch;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'type', type: 'varchar' })
  type: string;

  @Column({ type: 'enum', enum: ['mobile', 'bank', 'person'] })
  remarks: 'mobile' | 'bank' | 'person';

  @Column({ type: 'enum', enum: ['pending', 'disbursed', 'cancelled'], default: 'pending' })
  status: 'pending' | 'disbursed' | 'cancelled';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@ChildEntity('mobile')
export class MobileMoneyDisbursement extends Disbursement {
  @Column({ type: 'enum', enum: ['mtn', 'airtel'], nullable: true })
  provider: 'mtn' | 'airtel';

  @Column({ type: 'varchar', length: 20, nullable: true })
  mobileNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionID: string;
}

@ChildEntity('bank')
export class BankDisbursement extends Disbursement {
  @Column({ type: 'varchar', length: 100, nullable: true })
  bankName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  accountNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;
}

@ChildEntity('person')
export class PersonDisbursement extends Disbursement {
  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ type: 'uuid', nullable: true })
  signedDocumentID: string;
}
