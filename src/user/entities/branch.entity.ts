import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Profile } from './profile.entity';

//We shall add in extra data incase we need to
@Entity()
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'bool' })
  isHeadOffice: boolean;

  @Column({ type: 'varchar', length: 50 })
  countryName: string;

  @Column({ type: 'varchar', length: 2 })
  countryCode: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 15 })
  phone: string; // optional

  @Column({ type: 'varchar', length: 255 })
  email: string; // optional

  @OneToMany(() => Profile, (profile) => profile.branch)
  profiles: Profile[];
}
