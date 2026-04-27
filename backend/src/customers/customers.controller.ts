import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@Req() req: any, @Query('search') search?: string) {
    return this.customersService.findAll(req.businessId, search);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto, req.businessId, req.user.id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto, req.businessId, req.user.id);
  }
}
