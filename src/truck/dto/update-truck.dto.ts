import { IsInt, IsString } from 'class-validator';

export class UpdateTruckDto {
  @IsString()
  license: string;

  @IsInt()
  siteId: number;
}
