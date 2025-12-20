import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from './client.entity';

@Entity()
@Index(['clientID', 'contact'], { unique: true })
export class ClientContact {
  @PrimaryGeneratedColumn()
  id: number; // Fixed: was string, should be number

  @Column({ type: 'varchar', length: 50 })
  clientID: string;

  @ManyToOne(() => Client, (client) => client.contacts)
  @JoinColumn({ name: 'clientID' })
  client: Client;

  @Column({ type: 'enum', enum: ['email', 'mobile', 'home', 'work'] })
  contactType: 'email' | 'mobile' | 'home' | 'work';

  @Column({ type: 'varchar', length: 200 })
  contact: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
