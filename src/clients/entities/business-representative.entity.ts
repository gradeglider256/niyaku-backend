import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { BusinessClient } from './client.entity';

@Entity()
export class BusinessRepresentative {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 100 })
    role: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    nin: string;

    @Column()
    clientId: string;

    @ManyToOne(() => BusinessClient, (client) => client.representatives, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'clientId' })
    client: BusinessClient;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
