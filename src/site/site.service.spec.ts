import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { Site } from './site.entity';
import { SiteService } from './site.service';

const mockSiteRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});

describe('SiteService Methods', () => {
  let service: SiteService;
  let repository: jest.Mocked<Repository<Site>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiteService,
        { provide: getRepositoryToken(Site), useFactory: mockSiteRepository },
      ],
    }).compile();

    service = module.get<SiteService>(SiteService);
    repository = module.get(getRepositoryToken(Site));

    // Mocking findOne method as it is used internally by remove and update methods
    jest.spyOn(service, 'findOne').mockImplementation(async (id: number) => {
      if (id === 1) {
        return { id, name: 'Test Site', address: '123 Street' } as Site;
      }
      return null;
    });
  });

  describe('create', () => {
    it('should successfully create and save a site', async () => {
      const createSiteDto: CreateSiteDto = {
        name: 'New Site',
        address: '123 Street',
        description: 'Test Description',
      };
      const mockSite = { id: 1, ...createSiteDto };

      // Mock the repository behavior
      repository.create.mockReturnValue(mockSite as Site);
      repository.save.mockResolvedValue(mockSite as Site);

      const result = await service.create(createSiteDto);

      // Check that repository.create was called with correct DTO
      expect(repository.create).toHaveBeenCalledWith(createSiteDto);
      // Check that repository.save was called with the created site
      expect(repository.save).toHaveBeenCalledWith(mockSite);
      // Ensure the result matches the mockSite
      expect(result).toEqual(mockSite);
    });

    it('should throw an error if site creation fails', async () => {
      const createSiteDto: CreateSiteDto = {
        name: 'New Site',
        address: '123 Street',
        description: 'Test Description',
      };

      // Simulate repository.create returning null (site not created)
      repository.create.mockReturnValue(null);

      // Expect the service.create method to throw an error
      await expect(service.create(createSiteDto)).rejects.toThrow(
        'Could not create site',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of sites when sites exist', async () => {
      const mockSites = [{ id: 1, name: 'Site 1', address: 'Address 1' }];

      // Mock the find method to return an array of sites
      repository.find.mockResolvedValue(mockSites as Site[]);

      const result = await service.findAll();

      // Check that the repository.find was called
      expect(repository.find).toHaveBeenCalled();
      // Ensure the result matches the mockSites
      expect(result).toEqual(mockSites);
    });

    it('should throw a NotFoundException if no sites are found', async () => {
      // Mock the find method to return an empty array
      repository.find.mockResolvedValue([]);

      // Expect the service.findAll to throw a NotFoundException
      await expect(service.findAll()).rejects.toThrow(NotFoundException);
    });

    it('should throw a NotFoundException if null is returned', async () => {
      // Mock the find method to return null
      repository.find.mockResolvedValue(null);

      // Expect the service.findAll to throw a NotFoundException
      await expect(service.findAll()).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the updated site if the site is found', async () => {
      const updateSiteDto: UpdateSiteDto = {
        name: 'Updated Site',
        address: '',
        description: '',
      };
      const mockSite = { id: 1, name: 'Existing Site', address: '123 Street' };

      repository.save.mockResolvedValue({
        ...mockSite,
        ...updateSiteDto,
      } as Site);

      const result = await service.update(1, updateSiteDto);

      // Expect that findOne was called with the correct id
      expect(service.findOne).toHaveBeenCalledWith(1);
      // Expect that the repository.save was called with the updated site object
      expect(repository.save).toHaveBeenCalledWith({
        ...mockSite,
        ...updateSiteDto,
      });
      // The result should be the updated site
      expect(result).toEqual({ ...mockSite, ...updateSiteDto });
    });

    it('should throw a NotFoundException if the site is not found', async () => {
      const updateSiteDto: UpdateSiteDto = {
        name: 'Updated Site',
        address: '',
        description: '',
      };

      // Mock findOne to return null (site not found)
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      // Expect the update method to throw a NotFoundException
      await expect(service.update(2, updateSiteDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete the site if it exists', async () => {
      // Mock the delete method to resolve without any value
      repository.delete.mockResolvedValue(undefined);

      await service.remove(1);

      // Expect that findOne was called with the correct id
      expect(service.findOne).toHaveBeenCalledWith(1);
      // Expect that repository.delete was called with the correct id
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw a NotFoundException if the site does not exist', async () => {
      // Mock findOne to return null (site not found)
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      // Expect the remove method to throw a NotFoundException
      await expect(service.remove(2)).rejects.toThrow(NotFoundException);
    });
  });
});

// Test the findOne method separete from the other tests cause I needed to spy it in a separate test for Delete and Update tests
describe('SiteService - findOne Method', () => {
  let service: SiteService;
  let repository: jest.Mocked<Repository<Site>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiteService,
        { provide: getRepositoryToken(Site), useFactory: mockSiteRepository },
      ],
    }).compile();

    service = module.get<SiteService>(SiteService);
    repository = module.get(getRepositoryToken(Site));
  });

  describe('findOne', () => {
    it('should return a site if a site with the given ID is found', async () => {
      const mockSite = { id: 1, name: 'Test Site', trucks: [] };

      // Mock the findOne method to return a site
      repository.findOne.mockResolvedValue(mockSite as Site);

      const result = await service.findOne(1);

      // Check that the repository.findOne was called with correct options
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['trucks'],
      });

      // Ensure the result matches the mockSite
      expect(result).toEqual(mockSite);
    });

    it('should throw a NotFoundException if the site with the given ID is not found', async () => {
      // Mock the findOne method to return null (no site found)
      repository.findOne.mockResolvedValue(null);

      // Expect the service.findOne method to throw a NotFoundException
      await expect(service.findOne(1)).rejects.toThrow(
        new NotFoundException('Site with ID 1 not found'),
      );
    });
  });
});
