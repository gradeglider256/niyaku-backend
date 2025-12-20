import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { Branch } from '../../user/entities/branch.entity';
import { Disbursement } from './disemburse.entity';

@Entity()
export class Loan {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid' })
  clientID: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'clientID' })
  client: Client;

  @Column({ type: 'int' })
  branchID: number;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchID' })
  branch: Branch;

  @Column({ type: 'enum', enum: ['salary', 'personal', 'business'] })
  type: 'salary' | 'personal' | 'business';

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 50 })
  tenure: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interestRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  processingFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  emi: number; // estimated monthly income calculated from (processingFee + amount +interest) / tenure

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'disbursed', 'fully_paid'],
    default: 'pending',
  })
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'fully_paid';

  @OneToMany(() => Disbursement, (disbursement) => disbursement.loan)
  disbursements: Disbursement[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
