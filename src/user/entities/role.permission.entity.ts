import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Entity()
export class RolePermissions {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint' })
  permissionID: number;

  @ManyToOne(() => Permission)
  @JoinColumn({ name: 'permissionID' })
  permission: Permission;

  @Column({ type: 'uuid', nullable: false })
  roleID: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleID' })
  role: Role;

  @Column({ type: 'boolean', default: true })
  isPermissionActive: boolean;
}
