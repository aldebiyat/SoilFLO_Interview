import { IsDate, IsInt, IsString } from 'class-validator';

export class UpdateTicketDto {
  @IsInt()
  truckId: number;

  @IsDate()
  dispatchedTime: Date;
}
