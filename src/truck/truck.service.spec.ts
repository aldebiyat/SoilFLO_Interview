import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from '../site/site.entity';
import { CreateTruckDto } from './dto/create-truck.dto';
import { Truck } from './truck.entity';
import { TruckService } from './truck.service';

describe('TruckService', () => {
  let service: TruckService;
  let truckRepository: jest.Mocked<Repository<Truck>>;
  let siteRepository: jest.Mocked<Repository<Site>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TruckService,
        {
          provide: getRepositoryToken(Truck),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Site),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TruckService>(TruckService);
    truckRepository = module.get(getRepositoryToken(Truck));
    siteRepository = module.get(getRepositoryToken(Site));
  });

  describe('create', () => {
    it('should throw an error if site is not found', async () => {
      const createTruckDto: CreateTruckDto = { license: 'ABC123', siteId: 1 };

      // Mock the siteRepository to return null (site not found)
      siteRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createTruckDto)).rejects.toThrow(
        'Site not found',
      );
      expect(siteRepository.findOne).toHaveBeenCalledWith({
        where: { id: createTruckDto.siteId },
      });
      expect(truckRepository.create).not.toHaveBeenCalled();
      expect(truckRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error if truck was not created', async () => {
      const createTruckDto: CreateTruckDto = { license: 'ABC123', siteId: 1 };

      // Mock the siteRepository to return a valid site
      const site = { id: 1, name: 'Test Site' } as Site;
      siteRepository.findOne.mockResolvedValue(site);

      // Mock the truckRepository.create to return null (truck not created)
      truckRepository.create.mockReturnValue(null);

      await expect(service.create(createTruckDto)).rejects.toThrow(
        'Truck was not created',
      );

      expect(siteRepository.findOne).toHaveBeenCalledWith({
        where: { id: createTruckDto.siteId },
      });
      expect(truckRepository.create).toHaveBeenCalledWith({
        license: createTruckDto.license,
        site,
      });
      expect(truckRepository.save).not.toHaveBeenCalled();
    });

    it('should successfully create and save a truck', async () => {
      const createTruckDto: CreateTruckDto = { license: 'ABC123', siteId: 1 };

      // Mock the siteRepository to return a valid site
      const site = { id: 1, name: 'Test Site' } as Site;
      siteRepository.findOne.mockResolvedValue(site);

      // Mock the truckRepository.create and save methods
      const createdTruck = { id: 1, license: 'ABC123', site } as Truck;
      truckRepository.create.mockReturnValue(createdTruck);
      truckRepository.save.mockResolvedValue(createdTruck);

      const result = await service.create(createTruckDto);

      expect(siteRepository.findOne).toHaveBeenCalledWith({
        where: { id: createTruckDto.siteId },
      });
      expect(truckRepository.create).toHaveBeenCalledWith({
        license: createTruckDto.license,
        site,
      });
      expect(truckRepository.save).toHaveBeenCalledWith(createdTruck);
      expect(result).toEqual(createdTruck);
    });
  });

  describe('findOne', () => {
    it('should throw a NotFoundException if truck is not found', async () => {
      const truckId = 1;

      // Mock truckRepository to return null (truck not found)
      truckRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(truckId)).rejects.toThrow(
        new NotFoundException(`Truck with ID ${truckId} not found`),
      );

      expect(truckRepository.findOne).toHaveBeenCalledWith({
        where: { id: truckId },
        relations: ['site', 'tickets'],
      });
    });

    it('should return a truck if found', async () => {
      const truckId = 1;
      const truck = {
        id: truckId,
        license: 'ABC123',
        site: { id: 1, name: 'Test Site' },
        tickets: [],
      } as Truck;

      // Mock truckRepository to return a truck
      truckRepository.findOne.mockResolvedValue(truck);

      const result = await service.findOne(truckId);

      expect(truckRepository.findOne).toHaveBeenCalledWith({
        where: { id: truckId },
        relations: ['site', 'tickets'],
      });
      expect(result).toEqual(truck);
    });
  });
});
