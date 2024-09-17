import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Site } from '../site/site.entity';
import { Truck } from '../truck/truck.entity';

@Entity({ name: 'ticket' })
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Truck, (truck) => truck.tickets)
  truck: Truck;

  @ManyToOne(() => Site)
  site: Site;

  @CreateDateColumn()
  dispatchedTime: Date;

  @Column()
  ticketNumber: number;

  @Column({ default: 'Soil' })
  material: string;
}
