import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audits/audit.service';
import { normalizeCustomer, serializeTags } from '../common/serializers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(businessId: string, search?: string) {
    const customers = await this.prisma.customer.findMany({
      where: {
        businessId,
        ...(search
          ? {
            OR: [
              { name: { contains: search } },
              { phone: { contains: search } },
              { email: { contains: search } },
              { tags: { contains: search } },
            ],
          }
          : {}),
      },
      include: {
        leads: { orderBy: { createdAt: 'desc' } },
        appointments: { orderBy: { scheduledAt: 'desc' } },
        payments: { orderBy: { createdAt: 'desc' } },
        followUps: { orderBy: { dueAt: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return customers.map(normalizeCustomer);
  }

  async create(dto: CreateCustomerDto, businessId: string, actorUserId: string) {
    const customer = await this.prisma.customer.create({
      data: {
        ...dto,
        businessId,
        tags: serializeTags(dto.tags) ?? '[]',
      },
    });
    await this.audit.log({
      businessId,
      actorUserId,
      model: 'Customer',
      modelId: customer.id,
      action: 'CREATE',
      description: `Created customer ${customer.name}`,
      changes: dto,
    });
    return normalizeCustomer(customer);
  }

  async update(id: string, dto: UpdateCustomerDto, businessId: string, actorUserId: string) {
    await this.ensureExists(id, businessId);
    const customer = await this.prisma.customer.update({
      where: { id },
      data: {
        ...dto,
        tags: serializeTags(dto.tags),
      },
    });
    await this.audit.log({
      businessId,
      actorUserId,
      model: 'Customer',
      modelId: customer.id,
      action: 'UPDATE',
      description: `Updated customer ${customer.name}`,
      changes: dto,
    });
    return normalizeCustomer(customer);
  }

  private async ensureExists(id: string, businessId: string) {
    const customer = await this.prisma.customer.findFirst({ where: { id, businessId } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
  }
}
