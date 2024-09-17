import { IsInt, IsString } from 'class-validator';

export class CreateTruckDto {
  @IsString()
  license: string;

  @IsInt()
  siteId: number;
}
