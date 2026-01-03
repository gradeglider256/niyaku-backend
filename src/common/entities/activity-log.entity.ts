import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from '../../user/entities/profile.entity';
import { Branch } from '../../user/entities/branch.entity';

@Entity('activity_log')
@Index(['userId', 'timestamp'])
@Index(['actionType', 'timestamp'])
@Index(['entityType', 'timestamp'])
@Index(['branchID', 'timestamp'])
@Index(['timestamp'])
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  // @Index()
  actionType: string;

  @Column({ type: 'varchar', length: 10 })
  method: string;

  @Column({ type: 'varchar', length: 500 })
  endpoint: string;

  @Column({ type: 'varchar', length: 14, nullable: true })
  // @Index()
  userId: string | null;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: Profile | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userEmail: string | null;

  @Column({ type: 'simple-array', nullable: true })
  userRoles: string[] | null;

  @Column({ type: 'int', nullable: true })
  // @Index()
  branchID: number | null;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branchID' })
  branch: Branch | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  entityType: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  entityId: string | null;

  @Column({ type: 'int' })
  statusCode: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ipAddress: string | null;

  @Column({ type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;
}
