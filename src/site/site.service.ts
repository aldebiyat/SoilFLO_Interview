import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { Site } from './site.entity';

@Injectable()
export class SiteService {
  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
  ) {}

  /**
   * Create a new site
   *
   * @param {CreateSiteDto} createSiteDto
   * @returns {Promise<Site>}
   * @memberof SiteService
   */
  async create(createSiteDto: CreateSiteDto): Promise<Site> {
    const site = this.siteRepository.create(createSiteDto);
    if (!site) throw new Error('Could not create site');

    return await this.siteRepository.save(site);
  }

  /**
   * Get all sites
   *
   * @returns {Promise<Site[]>}
   * @memberof SiteService
   */
  async findAll(): Promise<Site[]> {
    const sites = await this.siteRepository.find();
    if (!sites || sites.length === 0)
      throw new NotFoundException('No sites found');

    return sites;
  }

  /**
   * Get a site by its ID
   *
   * @param {number} id
   * @returns {Promise<Site>}
   * @memberof SiteService
   */
  async findOne(id: number): Promise<Site> {
    const site = await this.siteRepository.findOne({
      where: { id },
      relations: ['trucks'],
    });

    if (!site) {
      throw new NotFoundException(`Site with ID ${id} not found`);
    }

    return site;
  }

  /**
   * Update a site by its ID
   *
   * @param {number} id
   * @param {UpdateSiteDto} updateSiteDto
   * @returns {(Promise<Site | undefined>)}
   * @memberof SiteService
   */
  async update(
    id: number,
    updateSiteDto: UpdateSiteDto,
  ): Promise<Site | undefined> {
    const site = await this.findOne(id);
    if (!site) throw new NotFoundException();

    Object.assign(site, updateSiteDto);
    return await this.siteRepository.save(site);
  }

  /**
   * Delete a site by its ID
   *
   * @param {number} id
   * @returns {(Promise<void>)}
   * @memberof SiteService
   */
  async remove(id: number): Promise<void> {
    const site = await this.findOne(id);
    if (!site) throw new NotFoundException();

    await this.siteRepository.delete(id);
  }
}
