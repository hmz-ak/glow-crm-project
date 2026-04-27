import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audits/audit.service';
import { normalizeNestedCustomer } from '../common/serializers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';

@Injectable()
export class FollowUpsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(businessId: string) {
    const followUps = await this.prisma.followUpTask.findMany({
      where: { businessId },
      include: { customer: true, lead: true },
      orderBy: [{ status: 'asc' }, { dueAt: 'asc' }],
    });
    return followUps.map(normalizeNestedCustomer);
  }

  async create(dto: CreateFollowUpDto, businessId: string, actorUserId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, businessId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const followUp = await this.prisma.followUpTask.create({
      data: {
        businessId,
        customerId: dto.customerId,
        leadId: dto.leadId,
        dueAt: new Date(dto.dueAt),
        reason: dto.reason,
        status: dto.status ?? 'Open',
        suggestedMessage:
          dto.suggestedMessage ??
          `Hi ${customer.name}, just following up on ${dto.reason.toLowerCase()}. Would you like to continue here?`,
      },
      include: { customer: true, lead: true },
    });

    await this.audit.log({
      businessId,
      actorUserId,
      model: 'FollowUpTask',
      modelId: followUp.id,
      action: 'CREATE',
      description: `Created follow-up ${followUp.reason}`,
      changes: dto,
    });
    return normalizeNestedCustomer(followUp);
  }

  async update(id: string, dto: UpdateFollowUpDto, businessId: string, actorUserId: string) {
    await this.ensureExists(id, businessId);
    const followUp = await this.prisma.followUpTask.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        leadId: dto.leadId,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        reason: dto.reason,
        status: dto.status,
        suggestedMessage: dto.suggestedMessage,
      },
      include: { customer: true, lead: true },
    });
    await this.audit.log({
      businessId,
      actorUserId,
      model: 'FollowUpTask',
      modelId: followUp.id,
      action: 'UPDATE',
      description: `Updated follow-up ${followUp.reason}`,
      changes: dto,
    });
    return normalizeNestedCustomer(followUp);
  }

  private async ensureExists(id: string, businessId: string) {
    const followUp = await this.prisma.followUpTask.findFirst({ where: { id, businessId } });
    if (!followUp) {
      throw new NotFoundException('Follow-up not found');
    }
  }
}
