import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RolePermissions } from './role.permission.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: '255' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ['global', 'branch'], default: 'branch' })
  level: 'global' | 'branch';

  @OneToMany(() => RolePermissions, (rolePermission) => rolePermission.role)
  permissions: RolePermissions[];
}
