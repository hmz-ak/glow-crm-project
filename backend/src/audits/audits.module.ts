import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditsController } from './audits.controller';

@Module({
  controllers: [AuditsController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditsModule {}
