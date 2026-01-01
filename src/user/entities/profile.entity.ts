import {
  Entity,
  Column,
  PrimaryColumn,
  JoinColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { Auth } from './auth.entity';
import { Branch } from './branch.entity';

@Entity()
export class Profile {
  @PrimaryColumn({ type: 'varchar', length: 14 })
  id: string;

  @Column({ type: 'varchar', length: 50 })
  firstName: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  lastName: string;

  @Column({ type: 'varchar', length: 50 })
  middleName: string;

  @Column('date')
  dateOfBirth: string;

  @Column({ type: 'enum', enum: ['male', 'female'] })
  gender: 'male' | 'female';

  @Column({ type: 'varchar', length: 50 }) //This needs to be extracted to a new entity that is used to match the stores profile and cover
  profile: string;

  @Column({ type: 'bigint' })
  branchID: number;

  @ManyToOne(() => Branch, (branch) => branch.profiles)
  @JoinColumn({ name: 'branchID' })
  branch: Branch;

  @Column('date')
  dateHired: string;

  @Column({ type: 'varchar', nullable: true })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  mobileNumber: string;

  @OneToOne(() => Auth, (auth) => auth.profile)
  @JoinColumn({ name: 'id' })
  auth: Auth;
}
