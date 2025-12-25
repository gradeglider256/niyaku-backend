import { Payment } from './payment.entity';
import { Client } from '../../clients/entities/client.entity';
import { Loan } from '../../disbursement/entities/loan.entity';
import { Branch } from '../../user/entities/branch.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Repayment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid' })
  clientID: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'clientID' })
  client: Client;

  @Column({ type: 'int' })
  loanID: number;

  @ManyToOne(() => Loan)
  @JoinColumn({ name: 'loanID' })
  loan: Loan;

  @Column({ type: 'int' })
  branchID: number;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchID' })
  branch: Branch;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  dateToBePaid: string;

  @Column({ type: 'date', nullable: true })
  datePaid: string;

  @Column({ type: 'enum', enum: ['pending', 'paid', 'overdue'] })
  status: 'pending' | 'paid' | 'overdue';

  @Column({ type: 'timestamp' })
  createdAt: string;

  @Column({ type: 'timestamp' })
  updatedAt: string;

  @OneToMany(() => Payment, (payment) => payment.repayment)
  payments: Payment[];
}
