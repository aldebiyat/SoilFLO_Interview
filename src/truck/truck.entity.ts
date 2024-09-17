import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Site } from '../site/site.entity';
import { Ticket } from '../ticket/ticket.entity';

@Entity({ name: 'truck' })
export class Truck {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  license: string;

  @ManyToOne(() => Site, (site) => site.trucks)
  site: Site;

  @OneToMany(() => Ticket, (ticket) => ticket.truck)
  tickets: Ticket[];
}
