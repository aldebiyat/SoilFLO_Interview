import { IsDate, IsInt, IsOptional } from 'class-validator';

export class FilterTicketDto {
  @IsOptional()
  @IsInt()
  siteId?: number;

  @IsOptional()
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;
}
