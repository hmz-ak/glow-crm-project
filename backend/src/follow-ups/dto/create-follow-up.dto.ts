import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateFollowUpDto {
  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  leadId?: string;

  @IsDateString()
  dueAt: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsIn(['Open', 'Done', 'Skipped'])
  status?: string;

  @IsOptional()
  @IsString()
  suggestedMessage?: string;
}
