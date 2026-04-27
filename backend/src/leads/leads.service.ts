import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audits/audit.service';
import { normalizeNestedCustomer } from '../common/serializers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(businessId: string) {
    const leads = await this.prisma.lead.findMany({
      where: { businessId },
      include: {
        customer: true,
        followUps: { orderBy: { dueAt: 'asc' } },
        appointments: { orderBy: { scheduledAt: 'desc' } },
      },
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
    });

    return leads.map(normalizeNestedCustomer);
  }

  async create(dto: CreateLeadDto, businessId: string, actorUserId: string) {
    const customerId =
      dto.customerId ??
      (
        await this.prisma.customer.create({
          data: {
            businessId,
            name: dto.customerName!,
            phone: dto.customerPhone!,
            email: dto.customerEmail,
            tags: JSON.stringify(['New lead']),
          },
        })
      ).id;

    const lead = await this.prisma.lead.create({
      data: {
        businessId,
        customerId,
        source: dto.source,
        serviceType: dto.serviceType,
        status: dto.status ?? 'New',
        valueEstimate: dto.valueEstimate,
        urgency: dto.urgency ?? 'Normal',
        nextFollowUpDate: dto.nextFollowUpDate
          ? new Date(dto.nextFollowUpDate)
          : this.defaultFollowUpDate(dto.urgency),
        notes: dto.notes,
      },
      include: { customer: true, followUps: true, appointments: true },
    });

    await this.prisma.followUpTask.create({
      data: {
        businessId,
        customerId,
        leadId: lead.id,
        dueAt: lead.nextFollowUpDate ?? this.defaultFollowUpDate(dto.urgency),
        reason: 'First response / booking nudge',
        suggestedMessage: this.buildLeadMessage(
          lead.customer.name,
          lead.serviceType,
          lead.urgency,
        ),
      },
    });

    if (lead.valueEstimate && lead.valueEstimate > 0) {
      await this.prisma.payment.create({
        data: {
          businessId,
          customerId,
          amount: lead.valueEstimate,
          status: 'Unpaid',
          method: 'To be confirmed',
          dueAt: lead.nextFollowUpDate ?? this.defaultFollowUpDate(dto.urgency),
        },
      });
    }

    await this.audit.log({
      businessId,
      actorUserId,
      model: 'Lead',
      modelId: lead.id,
      action: 'CREATE',
      description: `Created lead for ${lead.customer.name}`,
      changes: dto,
    });
    return normalizeNestedCustomer(lead);
  }

  async update(id: string, dto: UpdateLeadDto, businessId: string, actorUserId: string) {
    await this.ensureExists(id, businessId);
    const lead = await this.prisma.lead.update({
      where: { id },
      data: {
        source: dto.source,
        serviceType: dto.serviceType,
        status: dto.status,
        valueEstimate: dto.valueEstimate,
        urgency: dto.urgency,
        nextFollowUpDate: dto.nextFollowUpDate
          ? new Date(dto.nextFollowUpDate)
          : undefined,
        notes: dto.notes,
      },
      include: {
        customer: true,
        followUps: { orderBy: { dueAt: 'asc' } },
        appointments: { orderBy: { scheduledAt: 'desc' } },
      },
    });

    await this.audit.log({
      businessId,
      actorUserId,
      model: 'Lead',
      modelId: lead.id,
      action: 'UPDATE',
      description: `Updated lead ${lead.serviceType}`,
      changes: dto,
    });
    return normalizeNestedCustomer(lead);
  }

  private defaultFollowUpDate(urgency?: string) {
    const date = new Date();
    date.setHours(date.getHours() + (urgency === 'Hot' ? 2 : 24));
    return date;
  }

  private buildLeadMessage(name: string, service: string, urgency: string) {
    const timing =
      urgency === 'Hot'
        ? 'I can help reserve the earliest available slot.'
        : 'I can share available times whenever convenient.';
    return `Hi ${name}, thanks for asking about ${service}. ${timing} Would you like me to book this for you?`;
  }

  private async ensureExists(id: string, businessId: string) {
    const lead = await this.prisma.lead.findFirst({ where: { id, businessId } });
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }
  }
}
