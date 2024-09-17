import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateTruckDto } from './dto/create-truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';
import { TruckService } from './truck.service';

@Controller('trucks')
export class TruckController {
  constructor(private readonly truckService: TruckService) {}

  @Post()
  create(@Body() createTruckDto: CreateTruckDto) {
    return this.truckService.create(createTruckDto);
  }

  @Get()
  findAll() {
    return this.truckService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.truckService.findOne(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTruckDto: UpdateTruckDto) {
    return this.truckService.update(Number(id), updateTruckDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.truckService.remove(Number(id));
  }
}
