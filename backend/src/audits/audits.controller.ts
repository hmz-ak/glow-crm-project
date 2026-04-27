import { Controller, Get, Req } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audits')
export class AuditsController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.auditService.findAll(req.businessId);
  }
}
