import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { Branch } from '../../user/entities/branch.entity';
import { Profile } from '../../user/entities/profile.entity';

export enum AssessmentStatus {
    APPROVED = 'Approved',
    PENDING = 'Pending Review',
    REJECTED = 'Rejected',
}

@Entity()
export class AssessmentReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    clientID: string;

    @ManyToOne(() => Client)
    @JoinColumn({ name: 'clientID' })
    client: Client;

    @Column({ type: 'int' })
    branchID: number;

    @ManyToOne(() => Branch)
    @JoinColumn({ name: 'branchID' })
    branch: Branch;

    @Column({ type: 'varchar', length: 20 })
    riskRating: string;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    recommendedLimit: number;

    @Column({
        type: 'enum',
        enum: AssessmentStatus,
        default: AssessmentStatus.PENDING,
    })
    status: AssessmentStatus;

    @Column({ type: 'int', nullable: true })
    crbScore: number;

    @Column({ type: 'jsonb', nullable: true })
    liabilities: any;

    @Column({ type: 'text', nullable: true })
    findings: string;

    @Column({ type: 'boolean', default: false })
    isManualOverride: boolean;

    @Column({ type: 'varchar', length: 14, nullable: true })
    officerID: string;

    @ManyToOne(() => Profile)
    @JoinColumn({ name: 'officerID' })
    officer: Profile;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
