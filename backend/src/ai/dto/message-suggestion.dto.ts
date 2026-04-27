import { IsIn, IsOptional, IsString } from 'class-validator';

export class MessageSuggestionDto {
  @IsString()
  customerName: string;

  @IsString()
  serviceType: string;

  @IsOptional()
  @IsIn(['new-lead', 'booking-reminder', 'payment-due', 'win-back', 'thank-you'])
  intent?: string;

  @IsOptional()
  @IsString()
  businessName?: string;
}
