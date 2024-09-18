import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTruckDto } from './dto/update-truck.dto';
import { TruckController } from './truck.controller';
import { Truck } from './truck.entity';
import { TruckService } from './truck.service';

describe('TruckController', () => {
  let controller: TruckController;
  let service: TruckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TruckController],
      providers: [
        {
          provide: TruckService,
          useValue: {
            update: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TruckController>(TruckController);
    service = module.get<TruckService>(TruckService);
  });

  describe('update', () => {
    it('should call truckService.update with the correct parameters', async () => {
      const truckId = '1';
      const updateTruckDto: UpdateTruckDto = {
        license: 'XYZ987',
        siteId: 2,
      };

      const updatedTruck = {
        id: 1,
        license: 'XYZ987',
        site: { id: 2, name: 'Updated Site' },
      };

      jest.spyOn(service, 'update').mockResolvedValue(updatedTruck as Truck);

      const result = await controller.update(truckId, updateTruckDto);

      // Check that truckService.update was called with the correct parameters
      expect(service.update).toHaveBeenCalledWith(
        Number(truckId),
        updateTruckDto,
      );

      // Check that the result is what we mocked
      expect(result).toEqual(updatedTruck);
    });
  });

  describe('findAll', () => {
    it('should call truckService.findAll and return an array of trucks', async () => {
      const trucks: Truck[] = [
        {
          id: 1,
          license: 'ABC123',
          site: { id: 1, name: 'Site 1' },
          tickets: [],
        } as Truck,
        {
          id: 2,
          license: 'XYZ987',
          site: { id: 2, name: 'Site 2' },
          tickets: [],
        } as Truck,
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(trucks);

      const result = await controller.findAll();

      // Check that truckService.findAll was called
      expect(service.findAll).toHaveBeenCalled();

      // Check that the result is what we mocked
      expect(result).toEqual(trucks);
    });
  });
});
