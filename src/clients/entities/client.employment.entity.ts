import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from './client.entity';

@Entity()
export class ClientEmployment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  clientID: string;

  @ManyToOne(() => Client, (client) => client.employments)
  @JoinColumn({ name: 'clientID' })
  client: Client;

  @Column({ type: 'varchar', length: 200 })
  employer: string;

  @Column({ type: 'enum', enum: ['current', 'terminated'] })
  status: 'current' | 'terminated';

  @Column({
    type: 'enum',
    enum: ['self-employed', 'part-time', 'full-time', 'contract'],
  })
  type: 'self-employed' | 'part-time' | 'full-time' | 'contract'; // Fixed typo: part-type -> part-time

  @Column({ type: 'date' })
  startedAt: string;

  @Column({ type: 'date', nullable: true })
  contractEnd: string;

  @Column({ type: 'date', nullable: true })
  endedAt: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  monthlyGeneratedIncome: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
