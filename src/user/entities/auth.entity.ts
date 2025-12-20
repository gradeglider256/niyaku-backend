import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { AuthDevice } from './auth.devices.entity';
import { UserRole } from './user.role.entity';
import { Profile } from './profile.entity';

@Entity()
export class Auth {
  @PrimaryColumn({ type: 'varchar', length: 14 })
  id: string;

  @Column({ type: 'varchar', length: 9 }) //XXXX-XXXX
  emailVerificationCode: string;

  @Column({ type: 'timestamp' })
  emailVerificationInitAt: string;

  @Column({ type: 'timestamp' })
  emailVerifiedAt: string;

  @Column({ type: 'varchar', length: 9 })
  mobileVerificationCode: string;

  @Column({ type: 'timestamp' })
  mobileVerificationInitAt: string;

  @Column({ type: 'timestamp' })
  mobileVerifiedAt: string;

  @Column({ type: 'varchar', length: 8 })
  recoveryCode: string;

  @Column({ type: 'timestamp' })
  recoveryCodeInitAt: string;

  @Column({ type: 'timestamp' })
  recoveryCodeUsedAt: string;

  @Column({ select: false }) // <-- Hides password by default on queries
  password: string;

  @Column()
  salt: string;

  @OneToOne(() => Profile, (profile) => profile.auth)
  profile: Profile;

  @OneToMany(() => AuthDevice, (device) => device.user)
  devices: AuthDevice[];

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  roles: UserRole[];

  @Column({ type: 'boolean', default: false })
  isTemporaryPassword: boolean;
}
