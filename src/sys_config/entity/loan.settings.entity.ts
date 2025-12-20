import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class SystemConfig {
  @PrimaryColumn()
  branchID: number;

  // Use 'decimal' for financial values to ensure precision
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 50000 })
  minAmount: number;

  @Column({ type: 'int', default: 6 })
  minTenure: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 15 })
  defaultInterestRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 10000000 })
  maximumLoan: number;

  @Column({ type: 'int', default: 60 })
  maxTenure: number;

  @Column({ type: 'int', default: 3 })
  gracePeriod: number;
}
