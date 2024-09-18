import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from '../site/site.entity';
import { Truck } from '../truck/truck.entity';
import { toUTCString } from '../utils/date-utils';
import { BulkCreateTicketDto } from './dto/bulk-create-ticket.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { FilterTicketDto } from './dto/filter-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from './ticket.entity';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Truck)
    private readonly truckRepository: Repository<Truck>,
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
  ) {}

  /**
   * Create a new Ticket in bulk
   *
   * @param {BulkCreateTicketDto} bulkCreateTicketDto
   * @returns {Promise<Ticket[]>}
   * @memberof TicketService
   */
  async createBulkTickets(
    bulkCreateTicketDto: BulkCreateTicketDto,
  ): Promise<Ticket[]> {
    const ticketsToSave: Ticket[] = [];
    const { tickets } = bulkCreateTicketDto;

    // It helps keep track of the dispatchedTime values that have already been processed for each truckId within the same batch of tickets
    const dispatchedTimeTracker: { [key: string]: Set<string> } = {};

    // Group tickets by site to optimize ticket number assignment
    const ticketsBySite = tickets.reduce((acc, dto) => {
      if (!acc[dto.siteId]) {
        acc[dto.siteId] = [];
      }
      acc[dto.siteId].push(dto);
      return acc;
    }, {});

    for (const siteId in ticketsBySite) {
      const siteTickets = ticketsBySite[siteId];

      // Fetch the highest ticketNumber for the current site
      const lastTicket = await this.ticketRepository.findOne({
        where: { site: { id: +siteId } },
        order: { ticketNumber: 'DESC' },
      });

      let nextTicketNumber = lastTicket ? lastTicket.ticketNumber + 1 : 1;

      for (const dto of siteTickets) {
        const now = new Date();
        const dispatchedTime = new Date(dto.dispatchedTime);

        // Check if the dispatched time is in the future
        if (dispatchedTime > now) {
          throw new Error(
            `Ticket cannot have a dispatched time in the future for truck ID: ${dto.truckId}`,
          );
        }

        // Convert dispatchedTime to UTC using the custom utility function
        const dispatchedTimeUTC = toUTCString(dto.dispatchedTime);

        // Check if a ticket with the same dispatchedTime already exists for the truck in the database
        const existingTicket = await this.ticketRepository
          .createQueryBuilder('ticket')
          .where('ticket.truckId = :truckId', { truckId: dto.truckId })
          .andWhere(`ticket."dispatchedTime" = :dispatchedTime`, {
            dispatchedTime: dispatchedTimeUTC,
          })
          .getOne();

        if (existingTicket) {
          throw new Error(
            `Ticket with dispatched time ${dto.dispatchedTime} already exists for truck ID: ${dto.truckId}`,
          );
        }

        // Check for duplicate dispatchedTime within the same batch
        if (!dispatchedTimeTracker[dto.truckId]) {
          dispatchedTimeTracker[dto.truckId] = new Set();
        }

        if (
          dispatchedTimeTracker[dto.truckId].has(dispatchedTime.toISOString())
        ) {
          throw new Error(
            `Duplicate ticket with dispatched time ${dto.dispatchedTime} found in the batch for truck ID: ${dto.truckId}`,
          );
        }

        // Add the dispatchedTime to the tracker
        dispatchedTimeTracker[dto.truckId].add(dispatchedTime.toISOString());

        const ticket = this.ticketRepository.create({
          truck: { id: dto.truckId },
          site: { id: dto.siteId },
          dispatchedTime: dto.dispatchedTime,
          ticketNumber: nextTicketNumber++,
          material: 'Soil',
        });

        ticketsToSave.push(ticket);
      }
    }

    return await this.ticketRepository.save(ticketsToSave);
  }

  /**
   * Create a new ticket
   *
   * @param {CreateTicketDto} createTicketDto
   * @returns {Promise<Ticket>}
   * @memberof TicketService
   */
  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const { siteId, truckId, dispatchedTime } = createTicketDto;

    // Find the highest ticketNumber for this site
    const lastTicket = await this.ticketRepository.findOne({
      where: { id: siteId },
      order: { ticketNumber: 'DESC' },
    });

    const nextTicketNumber = lastTicket ? lastTicket.ticketNumber + 1 : 1;

    const ticket = this.ticketRepository.create({
      truck: { id: truckId },
      site: { id: siteId },
      dispatchedTime,
      ticketNumber: nextTicketNumber,
      material: 'Soil',
    });

    return await this.ticketRepository.save(ticket);
  }

  /**
   * Get all the tickets that match the specified criteria
   *
   * @param {FilterTicketDto} filterDto
   * @returns {*}
   * @memberof TicketService
   */
  async filterTickets(filterDto: FilterTicketDto) {
    const query = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.truck', 'truck')
      .leftJoinAndSelect('ticket.site', 'site')
      .select([
        'ticket.ticketNumber',
        'ticket.dispatchedTime',
        'ticket.material',
        'site.name',
        'truck.license',
      ]);

    // Apply site filter if provided
    if (filterDto.siteId) {
      query.andWhere('ticket.siteId = :siteId', { siteId: filterDto.siteId });
    }

    // Apply date range filter if both startDate and endDate are provided
    if (filterDto.startDate && filterDto.endDate) {
      query.andWhere('ticket.dispatchedTime BETWEEN :startDate AND :endDate', {
        startDate: filterDto.startDate,
        endDate: filterDto.endDate,
      });
    }

    // Execute the query and get the filtered results
    return await query.getMany();
  }

  /**
   * Get one ticket by its ID
   *
   * @param {number} id
   * @returns {Promise<Ticket>}
   * @memberof TicketService
   */
  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['site', 'truck'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  /**
   * Update a ticket by its ID
   *
   * @param {number} id
   * @param {UpdateTicketDto} updateTicketDto
   * @returns {(Promise<Ticket | undefined>)}
   * @memberof TicketService
   */
  async update(
    id: number,
    updateTicketDto: UpdateTicketDto,
  ): Promise<Ticket | undefined> {
    const ticket = await this.findOne(id);
    if (!ticket) throw new NotFoundException();

    Object.assign(ticket, updateTicketDto);
    return await this.ticketRepository.save(ticket);
  }

  /**
   * Delete a ticket by its ID
   *
   * @param {number} id
   * @returns {Promise<void>}
   * @memberof TicketService
   */
  async remove(id: number): Promise<void> {
    const ticket = await this.findOne(id);
    if (!ticket) throw new NotFoundException(`Ticket with ID ${id} not found`);

    await this.ticketRepository.delete(id);
  }
}
