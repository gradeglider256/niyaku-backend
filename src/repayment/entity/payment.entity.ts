import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Repayment } from './repayment.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int' })
  repaymentID: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amountPaid: number;

  @Column({ type: 'enum', enum: ['mobile-money', 'cash', 'bank', 'cheque'] })
  paymentMethod: 'mobile-money' | 'cash' | 'bank' | 'cheque';

  @Column({ type: 'date' })
  paymentDate: string;

  @ManyToOne(() => Repayment, (repayment) => repayment.payments)
  @JoinColumn({ name: 'repaymentID' })
  repayment: Repayment;

  @Column({ type: 'timestamp' })
  createdAt: string;
}
