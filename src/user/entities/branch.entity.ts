import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

//We shall add in extra data incase we need to
@Entity()
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'bool' })
  isHeadOffice: string;

  @Column({ type: 'varchar', length: 50 })
  countryName: string;

  @Column({ type: 'varchar', length: 2 })
  countryCode: string;
}
