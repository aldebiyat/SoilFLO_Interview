import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Truck } from '../truck/truck.entity';

@Entity({ name: 'site' })
export class Site {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Truck, (truck) => truck.site)
  trucks: Truck[];
}
