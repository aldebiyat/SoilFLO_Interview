import { Test, TestingModule } from '@nestjs/testing';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { SiteController } from './site.controller';
import { Site } from './site.entity';
import { SiteService } from './site.service';

const mockSiteService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('SiteController', () => {
  let controller: SiteController;
  let service: jest.Mocked<SiteService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SiteController],
      providers: [{ provide: SiteService, useFactory: mockSiteService }],
    }).compile();

    controller = module.get<SiteController>(SiteController);
    service = module.get(SiteService);
  });

  describe('create', () => {
    it('should create a site', async () => {
      const createSiteDto: CreateSiteDto = {
        name: 'Test Site',
        address: '123 Street',
        description: '',
      };
      const mockSite = { id: 1, ...createSiteDto };

      service.create.mockResolvedValue(mockSite as Site);

      const result = await controller.create(createSiteDto);

      expect(result).toEqual(mockSite);
      expect(service.create).toHaveBeenCalledWith(createSiteDto);
    });
  });

  // No need for more tests for findAll, findOne, update, and remove as they are tested in the respective service methods.
  // The reason why I added this test is for the test command to run all tests withiout having (There should be at least one test) error.
});
