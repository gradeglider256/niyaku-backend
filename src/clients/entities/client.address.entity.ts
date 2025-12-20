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
export class ClientAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  clientID: string; // Fixed typo from cliendID

  @ManyToOne(() => Client, (client) => client.addresses)
  @JoinColumn({ name: 'clientID' })
  client: Client;

  @Column({ type: 'varchar', length: 100 })
  district: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  county: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subcounty: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  parish: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
