import { IsOptional, IsString } from 'class-validator';

export class UpdateSiteDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  description: string;
}
