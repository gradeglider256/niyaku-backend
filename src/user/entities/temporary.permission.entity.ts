import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Permission } from './permission.entity';
import { Auth } from './auth.entity';

@Entity()
export class TemporaryPermission {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint' })
  permissionID: number;

  @ManyToOne(() => Permission)
  @JoinColumn({ name: 'permissionID' })
  permission: Permission;

  @Column('timestamp')
  expiresAt: string;

  @Column({ type: 'varchar', length: 14 })
  userID: string;

  @ManyToOne(() => Auth)
  @JoinColumn({ name: 'userID' })
  user: Auth;
}
