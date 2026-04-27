import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadsService } from './leads.service';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.leadsService.findAll(req.businessId);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto, req.businessId, req.user.id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsService.update(id, dto, req.businessId, req.user.id);
  }
}
