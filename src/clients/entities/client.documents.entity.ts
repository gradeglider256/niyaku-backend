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
import { Document } from '../../documents/entities/document.entity';

@Entity()
export class ClientDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', })
  clientID: string;

  @ManyToOne(() => Client, (client) => client.documents)
  @JoinColumn({ name: 'clientID' })
  client: Client;

  @Column({
    type: 'enum',
    enum: ['national-id', 'pay-slip', 'employment-letter', 'other'],
  })
  documentType: 'national-id' | 'pay-slip' | 'employment-letter' | 'other';

  @Column({ type: 'uuid' })
  documentId: string;

  @ManyToOne(() => Document)
  @JoinColumn({ name: 'documentId' })
  document: Document;

  @Column({ type: 'varchar', length: 14, nullable: true })
  uploadedBy: string; // User ID who uploaded

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
