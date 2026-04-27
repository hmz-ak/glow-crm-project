import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateLeadDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @ValidateIf((dto) => !dto.customerId)
  @IsString()
  @MinLength(2)
  customerName?: string;

  @ValidateIf((dto) => !dto.customerId)
  @IsString()
  @MinLength(5)
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsString()
  source: string;

  @IsString()
  serviceType: string;

  @IsOptional()
  @IsIn(['New', 'Contacted', 'Booked', 'Served', 'Follow-up', 'Won', 'Lost'])
  status?: string;

  @IsOptional()
  @IsNumber()
  valueEstimate?: number;

  @IsOptional()
  @IsIn(['Low', 'Normal', 'Hot'])
  urgency?: string;

  @IsOptional()
  @IsDateString()
  nextFollowUpDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
