import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Site } from '../site/site.entity';
import { Truck } from '../truck/truck.entity';
import { BulkCreateTicketDto } from './dto/bulk-create-ticket.dto';
import { FilterTicketDto } from './dto/filter-ticket.dto';
import { Ticket } from './ticket.entity';
import { TicketService } from './ticket.service';

const mockTicketRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  })),
});

const mockTruckRepository = () => ({
  findOne: jest.fn(),
});

const mockSiteRepository = () => ({
  findOne: jest.fn(),
});

describe('TicketService', () => {
  let service: TicketService;
  let ticketRepository: jest.Mocked<Repository<Ticket>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        {
          provide: getRepositoryToken(Ticket),
          useFactory: mockTicketRepository,
        },
        { provide: getRepositoryToken(Truck), useFactory: mockTruckRepository },
        { provide: getRepositoryToken(Site), useFactory: mockSiteRepository },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);
    ticketRepository = module.get(getRepositoryToken(Ticket));
  });

  describe('createBulkTickets', () => {
    it('should successfully create and save tickets for multiple sites and trucks', async () => {
      const bulkCreateTicketDto: BulkCreateTicketDto = {
        tickets: [
          {
            truckId: 1,
            siteId: 1,
            dispatchedTime: new Date('2024-09-10T10:00:00Z'),
          },
          {
            truckId: 2,
            siteId: 1,
            dispatchedTime: new Date('2024-09-10T11:00:00Z'),
          },
        ],
      };

      // Mock the tickets to be created
      const mockTickets: Ticket[] = bulkCreateTicketDto.tickets.map(
        (dto, index) => {
          const ticket = new Ticket();
          Object.assign(ticket, {
            truck: { id: dto.truckId } as Truck,
            site: { id: dto.siteId } as Site,
            dispatchedTime: new Date(dto.dispatchedTime),
            ticketNumber: index + 1,
            material: 'Soil',
          });
          return ticket;
        },
      );

      // Mock the createQueryBuilder chain of methods
      const queryBuilderMock = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null), // No existing tickets
      };

      // Mock createQueryBuilder on the ticket repository
      (ticketRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        queryBuilderMock,
      );

      // Mock the create and save functions
      ticketRepository.create.mockImplementation(
        (ticketData: DeepPartial<Ticket>) => {
          const ticket = new Ticket();
          Object.assign(ticket, ticketData); // Assign the ticketData to the ticket instance
          return ticket; // Return the populated Ticket instance
        },
      );

      // Mock save function to resolve an array of tickets
      (ticketRepository.save as jest.Mock).mockResolvedValue(mockTickets);

      const result = await service.createBulkTickets(bulkCreateTicketDto);

      // Ensure the repository.create was called with the correct ticket data
      expect(ticketRepository.create).toHaveBeenCalledTimes(2);
      expect(ticketRepository.save).toHaveBeenCalledWith(mockTickets);

      // Match only the relevant fields since the objects are Ticket instances
      result.forEach((ticket, index) => {
        expect(ticket.truck.id).toEqual(mockTickets[index].truck.id);
        expect(ticket.site.id).toEqual(mockTickets[index].site.id);
        expect(ticket.ticketNumber).toEqual(mockTickets[index].ticketNumber);
        expect(ticket.material).toEqual('Soil');
        expect(ticket.dispatchedTime).toEqual(
          mockTickets[index].dispatchedTime,
        );
      });
    });

    it('should throw an error if a ticket with the same dispatched time and truckId already exists', async () => {
      const bulkCreateTicketDto: BulkCreateTicketDto = {
        tickets: [
          {
            truckId: 1,
            siteId: 1,
            dispatchedTime: new Date('2024-09-10T10:00:00Z'),
          },
        ],
      };

      const queryBuilderMock = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(new Ticket()),
      };

      (ticketRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        queryBuilderMock,
      );

      await expect(
        service.createBulkTickets(bulkCreateTicketDto),
      ).rejects.toThrow(
        `Ticket with dispatched time ${bulkCreateTicketDto.tickets[0].dispatchedTime} already exists for truck ID: ${bulkCreateTicketDto.tickets[0].truckId}`,
      );
    });

    it('should throw an error if a dispatched date is in the future', async () => {
      const bulkCreateTicketDto: BulkCreateTicketDto = {
        tickets: [
          {
            truckId: 1,
            siteId: 1,
            dispatchedTime: new Date('3024-09-10T10:00:00Z'), // Future date
          },
        ],
      };

      const queryBuilderMock = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      (ticketRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        queryBuilderMock,
      );

      await expect(
        service.createBulkTickets(bulkCreateTicketDto),
      ).rejects.toThrow(
        `Ticket cannot have a dispatched time in the future for truck ID: ${bulkCreateTicketDto.tickets[0].truckId}`,
      );
    });
  });

  describe('filterTickets', () => {
    it('should call createQueryBuilder and return filtered tickets', async () => {
      const filterDto: FilterTicketDto = {
        siteId: 1,
        startDate: new Date('2024-09-01T00:00:00.000Z'),
        endDate: new Date('2024-09-30T00:00:00.000Z'),
      };

      // Call the function and execute the query
      const result = await service.filterTickets(filterDto);

      // Check that createQueryBuilder was called with the 'ticket' alias
      expect(ticketRepository.createQueryBuilder).toHaveBeenCalledWith(
        'ticket',
      );

      // Get the query builder mock returned by the call
      const queryBuilder =
        ticketRepository.createQueryBuilder.mock.results[0].value;

      // Check that the correct joins were made
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'ticket.truck',
        'truck',
      );
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'ticket.site',
        'site',
      );

      // Check that select was called with correct fields
      expect(queryBuilder.select).toHaveBeenCalledWith([
        'ticket.ticketNumber',
        'ticket.dispatchedTime',
        'ticket.material',
        'site.name',
        'truck.license',
      ]);

      // Check that andWhere was called with the correct filter conditions
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'ticket.siteId = :siteId',
        { siteId: 1 },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'ticket.dispatchedTime BETWEEN :startDate AND :endDate',
        {
          startDate: new Date('2024-09-01T00:00:00.000Z'),
          endDate: new Date('2024-09-30T00:00:00.000Z'),
        },
      );

      // Ensure getMany was called
      expect(queryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should apply no filters if none are provided', async () => {
      const filterDto: FilterTicketDto = {};

      // Call the function and execute the query
      const result = await service.filterTickets(filterDto);

      // Get the query builder mock returned by the call
      const queryBuilder =
        ticketRepository.createQueryBuilder.mock.results[0].value;

      // Check that no andWhere calls were made
      expect(queryBuilder.andWhere).not.toHaveBeenCalled();

      // Ensure getMany was called
      expect(queryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
