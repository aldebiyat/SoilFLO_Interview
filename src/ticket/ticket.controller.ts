import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { BulkCreateTicketDto } from './dto/bulk-create-ticket.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { FilterTicketDto } from './dto/filter-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketService } from './ticket.service';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketService.create(createTicketDto);
  }

  @Post('bulk-create')
  async createBulkTickets(@Body() bulkCreateTicketDto: BulkCreateTicketDto) {
    return this.ticketService.createBulkTickets(bulkCreateTicketDto);
  }

  @Get()
  getTickets(@Query() filterTicketDto: FilterTicketDto) {
    return this.ticketService.filterTickets(filterTicketDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketService.findOne(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTicketkDto: UpdateTicketDto) {
    return this.ticketService.update(Number(id), updateTicketkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketService.remove(Number(id));
  }
}
