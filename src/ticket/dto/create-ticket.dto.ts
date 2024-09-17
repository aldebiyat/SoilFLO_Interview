import { IsDate, IsInt } from 'class-validator';

export class CreateTicketDto {
  @IsInt()
  truckId: number;

  @IsInt()
  siteId: number;

  @IsDate()
  dispatchedTime: Date;
}
