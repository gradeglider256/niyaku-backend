import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmploymentHistory } from './employment.entity';

@Entity()
export class SalaryHistory {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int' })
  employmentHistoryID: number;

  @ManyToOne(() => EmploymentHistory)
  @JoinColumn({ name: 'employmentHistoryID' })
  employment: EmploymentHistory;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  baseSalary: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  allowances: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  deductions: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  netSalary: number;

  @Column({ type: 'varchar', length: 20 })
  month: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'date', nullable: true })
  payDate: string;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', default: true })
  isCurrent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
