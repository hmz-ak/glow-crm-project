import { IsDateString, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  leadId?: string;

  @IsString()
  service: string;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsIn(['New', 'Contacted', 'Booked', 'Served', 'Follow-up', 'Won', 'Lost'])
  status?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
