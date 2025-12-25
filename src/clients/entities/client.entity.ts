import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  TableInheritance,
  ChildEntity,
  UpdateDateColumn,
} from 'typeorm';
import { ClientAddress } from './client.address.entity';
import { ClientContact } from './client.contact.entity';
import { ClientDocument } from './client.documents.entity';
import { ClientFinancial } from './client.financial.entity';
import { Branch } from '../../user/entities/branch.entity';
import { BusinessRepresentative } from './business-representative.entity';
import { EmploymentHistory } from '../../credit_assessment/entities/employment.entity';
import { CompanyEarnings } from '../../credit_assessment/entities/company-earnings.entity';
import { AssessmentReport } from '../../credit_assessment/entities/assessment-report.entity';

export enum ClientType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
}

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ClientType })
  type: ClientType;

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

  @OneToMany(() => ClientFinancial, (financial) => financial.client)
  financials: ClientFinancial[];

  @OneToMany(() => EmploymentHistory, (employment) => employment.client)
  employmentHistory: EmploymentHistory[];

  @OneToMany(() => CompanyEarnings, (earning) => earning.client)
  companyEarnings: CompanyEarnings[];

  @OneToMany(() => AssessmentReport, (assessment) => assessment.client)
  assessmentReports: AssessmentReport[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@ChildEntity(ClientType.INDIVIDUAL)
export class IndividualClient extends Client {
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  middleName: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  nin: string;
}

@ChildEntity(ClientType.BUSINESS)
export class BusinessClient extends Client {
  @Column({ type: 'varchar', length: 200 })
  businessName: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  registrationNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  businessType: string;

  @OneToMany(() => BusinessRepresentative, (rep) => rep.client, {
    cascade: true,
  })
  representatives: BusinessRepresentative[];
}
