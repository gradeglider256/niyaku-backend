import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ClientRiskProfile {
  @PrimaryColumn()
  clientID: string;

  @Column()
  category: 'low' | 'medium' | 'high';
}
