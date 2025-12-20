import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClientAddress } from './client.address.entity';
import { ClientContact } from './client.contact.entity';
import { ClientDocument } from './client.documents.entity';
import { ClientEmployment } from './client.employment.entity';
import { ClientFinancial } from './client.financial.entity';
import { Branch } from '../../user/entities/branch.entity';

@Entity()
@Index(['id'], { unique: true })
export class Client {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string; // NIN to prevent duplication

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  middleName: string;

  @Column({ type: 'int' })
  branchID: number;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchID' })
  branch: Branch;

  @OneToMany(() => ClientAddress, (address) => address.client)
  addresses: ClientAddress[];

  @OneToMany(() => ClientContact, (contact) => contact.client)
  contacts: ClientContact[];

  @OneToMany(() => ClientDocument, (document) => document.client)
  documents: ClientDocument[];

  @OneToMany(() => ClientEmployment, (employment) => employment.client)
  employments: ClientEmployment[];

  @OneToMany(() => ClientFinancial, (financial) => financial.client)
  financials: ClientFinancial[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
