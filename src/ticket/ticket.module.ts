import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from '../site/site.entity';
import { Truck } from '../truck/truck.entity';
import { TicketController } from './ticket.controller';
import { Ticket } from './ticket.entity';
import { TicketRepository } from './ticket.repository';
import { TicketService } from './ticket.service';

@Module({
  imports: [TypeOrmModule.forFeature([Site, Ticket, Truck])],
  providers: [TicketService, TicketRepository],
  controllers: [TicketController],
  exports: [TicketService],
})
export class TicketModule {}
