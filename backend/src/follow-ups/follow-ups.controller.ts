import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';
import { FollowUpsService } from './follow-ups.service';

@Controller('follow-ups')
export class FollowUpsController {
  constructor(private readonly followUpsService: FollowUpsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.followUpsService.findAll(req.businessId);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateFollowUpDto) {
    return this.followUpsService.create(dto, req.businessId, req.user.id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateFollowUpDto) {
    return this.followUpsService.update(id, dto, req.businessId, req.user.id);
  }
}
