import { EntityRepository, Repository } from 'typeorm';
import { Ticket } from './ticket.entity';

@EntityRepository(Ticket)
export class TicketRepository extends Repository<Ticket> {}
