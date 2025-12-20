import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Auth } from './auth.entity';
import { Role } from './role.entity';

@Entity()
export class UserRole {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({ type: 'varchar', length: 14 })
  userID: string;

  @Column({ type: 'uuid' })
  roleID: string;

  @Column({ type: 'bigint', nullable: true }) // This is used to confine a role to a branch
  branch?: number;

  @ManyToOne(() => Auth, (auth) => auth.roles)
  @JoinColumn({ name: 'userID', referencedColumnName: 'id' })
  user: Auth;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleID', referencedColumnName: 'id' })
  role: Role;
}
