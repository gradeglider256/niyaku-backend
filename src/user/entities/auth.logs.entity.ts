import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Auth } from './auth.entity';

@Entity()
export class AuthLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type:
    | 'assignment'
    | 'removal'
    | 'temporary_assignment'
    | 'temporary_removal'
    | 'role_creation'
    | 'role_deletion'
    | 'add_role_permission'
    | 'remove_role_permission';

  @Column()
  user_id: string;

  @ManyToOne(() => Auth)
  @JoinColumn({ name: 'user_id' })
  user: Auth;

  @Column()
  change_affects: string;

  @ManyToOne(() => Auth)
  @JoinColumn({ name: 'change_affects' })
  affected_user: Auth;

  @Column()
  description: string;

  @Column()
  date: string;
}
