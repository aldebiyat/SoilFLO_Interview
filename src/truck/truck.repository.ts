import { EntityRepository, Repository } from 'typeorm';
import { Truck } from './truck.entity';

@EntityRepository(Truck)
export class TruckRepository extends Repository<Truck> {}
