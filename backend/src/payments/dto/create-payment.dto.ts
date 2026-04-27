import { IsDateString, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  appointmentId?: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsNumber()
  paidAmount?: number;

  @IsOptional()
  @IsIn(['Unpaid', 'Partial', 'Paid', 'Refunded'])
  status?: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
