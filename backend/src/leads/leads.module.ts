import { Module } from '@nestjs/common';
import { AuditsModule } from '../audits/audits.module';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

@Module({
  imports: [AuditsModule],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
