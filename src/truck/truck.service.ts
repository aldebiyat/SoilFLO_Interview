import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from '../site/site.entity';
import { CreateTruckDto } from './dto/create-truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';
import { Truck } from './truck.entity';

@Injectable()
export class TruckService {
  constructor(
    @InjectRepository(Truck)
    private readonly truckRepository: Repository<Truck>,
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
  ) {}

  /**
   * Create a new truck
   *
   * @param {CreateTruckDto} createTruckDto
   * @return {Promise<Truck>}
   * @memberof TruckService
   */
  async create(createTruckDto: CreateTruckDto): Promise<Truck> {
    const { license, siteId } = createTruckDto;
    const site = await this.siteRepository.findOne({ where: { id: siteId } });
    if (!site) throw new Error('Site not found');

    const truck = this.truckRepository.create({ license, site });
    if (!truck) throw new Error('Truck was not created');

    return await this.truckRepository.save(truck);
  }

  /**
   * Get all trucks
   *
   * @return {Promise<Truck[]>}
   * @memberof TruckService
   */
  async findAll(): Promise<Truck[]> {
    const trucks = await this.truckRepository.find();
    if (!trucks || trucks.length === 0) throw new Error('No trucks found');

    return trucks;
  }

  /**
   * Get a truck by its ID
   *
   * @param {number} id
   * @return {Promise<Truck>}
   * @memberof TruckService
   */
  async findOne(id: number): Promise<Truck> {
    const truck = await this.truckRepository.findOne({
      where: { id },
      relations: ['site', 'tickets'],
    });

    if (!truck) {
      throw new NotFoundException(`Truck with ID ${id} not found`);
    }

    return truck;
  }

  /**
   * Update a truck ny its ID
   *
   * @param {number} id
   * @param {UpdateTruckDto} updateTruckDto
   * @return {(Promise<Truck | undefined>)}
   * @memberof TruckService
   */
  async update(
    id: number,
    updateTruckDto: UpdateTruckDto,
  ): Promise<Truck | undefined> {
    const truck = await this.findOne(id);
    if (!truck) throw new NotFoundException();

    Object.assign(truck, updateTruckDto);
    return await this.truckRepository.save(truck);
  }

  /**
   * Delete a truck by its ID
   *
   * @param {number} id
   * @return {Promise<void>}
   * @memberof TruckService
   */
  async remove(id: number): Promise<void> {
    const truck = await this.findOne(id);
    if (!truck) throw new NotFoundException(`Truck with ID ${id} not found`);

    await this.truckRepository.delete(id);
  }
}
