import { Test, TestingModule } from '@nestjs/testing';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketController } from './ticket.controller';
import { Ticket } from './ticket.entity';
import { TicketService } from './ticket.service';

describe('TicketController', () => {
  let ticketController: TicketController;
  let ticketService: TicketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [
        {
          provide: TicketService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    ticketController = module.get<TicketController>(TicketController);
    ticketService = module.get<TicketService>(TicketService);
  });

  describe('create', () => {
    it('should call ticketService.create with the correct DTO', async () => {
      const createTicketDto: CreateTicketDto = {
        truckId: 1,
        siteId: 1,
        dispatchedTime: new Date('2024-09-10T10:00:00Z'),
      };

      const expectedResponse = { id: 1, ...createTicketDto };

      jest.spyOn(ticketService, 'create');
      jest
        .spyOn(ticketService, 'create')
        .mockResolvedValue(expectedResponse as unknown as Ticket);

      const result = await ticketController.create(createTicketDto);

      expect(ticketService.create).toHaveBeenCalledWith(createTicketDto);
      expect(result).toEqual(expectedResponse);
    });
  });
});
