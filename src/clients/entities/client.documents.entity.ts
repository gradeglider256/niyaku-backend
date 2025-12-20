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
export class ClientDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  clientID: string;

  @ManyToOne(() => Client, (client) => client.documents)
  @JoinColumn({ name: 'clientID' })
  client: Client;

  @Column({
    type: 'enum',
    enum: ['national-id', 'pay-slip', 'employment-letter', 'other'],
  })
  documentType: 'national-id' | 'pay-slip' | 'employment-letter' | 'other';

  @Column({ type: 'text' })
  documentLocation: string;

  @Column({ type: 'enum', enum: ['pdf', 'docs', 'jpg', 'jpeg', 'png', 'webp'] })
  fileType: 'pdf' | 'docs' | 'jpg' | 'jpeg' | 'png' | 'webp';

  @Column({ type: 'varchar', length: 14, nullable: true })
  uploadedBy: string; // User ID who uploaded

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
