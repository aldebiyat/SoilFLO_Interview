import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from '../site/site.entity';
import { TruckController } from './truck.controller';
import { Truck } from './truck.entity';
import { TruckRepository } from './truck.repository';
import { TruckService } from './truck.service';

@Module({
  imports: [TypeOrmModule.forFeature([Truck, Site])],
  providers: [TruckService, TruckRepository],
  controllers: [TruckController],
  exports: [TruckService],
})
export class TruckModule {}
