import { Client } from '../../clients/entities/client.entity';
import { Loan } from '../../disbursement/entities/loan.entity';
import { Branch } from '../../user/entities/branch.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Repayment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid' })
  clientID: string;

  @ManyToOne(() => Client)
  client: Client;

  @Column({ type: 'int' })
  loanID: number;

  @ManyToOne(() => Loan)
  loan: Loan;

  @Column({ type: 'int' })
  branchID: number;

  @ManyToOne(() => Branch)
  branch: Branch;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  interest: number;

  @Column({ type: 'date' })
  dateToBePaid: string;

  @Column({ type: 'date' })
  datePaid: string;

  @Column({ type: 'enum', enum: ['pending', 'paid', 'overdue'] })
  status: 'pending' | 'paid' | 'overdue';

  @Column({ type: 'timestamp' })
  createdAt: string;

  @Column({ type: 'timestamp' })
  updatedAt: string;
}
