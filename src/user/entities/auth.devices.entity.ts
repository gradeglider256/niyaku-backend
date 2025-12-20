import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Auth } from './auth.entity';

@Entity()
export class AuthDevice {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 14 })
  userID: string;

  @Column({ type: 'text' })
  token: string;

  @Column({ type: 'varchar', length: 12 })
  deviceTFA: string;

  @Column({ type: 'text' })
  refreshToken: string;

  @Column({ type: 'varchar', length: 55 })
  deviceID: string;

  @Column({ type: 'date', nullable: true })
  lastSignin: string;

  @ManyToOne(() => Auth, (auth) => auth.devices)
  @JoinColumn({ name: 'userID', referencedColumnName: 'id' })
  user: Auth;
}
