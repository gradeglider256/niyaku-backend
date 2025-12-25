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
import { SalaryHistory } from './salary.entity';

@Entity()
export class EmploymentHistory {
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

  @Column({ type: 'varchar', length: 255 })
  employerName: string;

  @Column({ type: 'varchar', length: 100 })
  industry: string;

  @Column({ type: 'varchar', length: 100 })
  position: string;

  @Column({
    type: 'enum',
    enum: ['permanent', 'contract', 'casual', 'other'],
    default: 'permanent',
  })
  contractType: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contractDuration: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string;

  @Column({
    type: 'enum',
    enum: ['current', 'past'],
    default: 'current',
  })
  status: string;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @OneToMany(() => SalaryHistory, (salary) => salary.employment)
  salaryHistory: SalaryHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
