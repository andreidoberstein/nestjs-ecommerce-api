import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  orderId: number;
}