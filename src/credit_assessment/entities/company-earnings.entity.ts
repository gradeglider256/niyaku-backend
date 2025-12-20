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

@Entity()
export class CompanyEarnings {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    clientID: string;

    @ManyToOne(() => Client)
    @JoinColumn({ name: 'clientID' })
    client: Client;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    monthlyEarning: number;

    @Column({ type: 'int' })
    financialYear: number;

    @Column({ type: 'boolean', default: false })
    isAudited: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
