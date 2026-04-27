import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audits/audit.service';
import { normalizeNestedCustomer } from '../common/serializers';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(businessId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { businessId },
      include: { customer: true, appointment: true },
      orderBy: [{ status: 'desc' }, { dueAt: 'asc' }],
    });
    return payments.map(normalizeNestedCustomer);
  }

  async create(dto: CreatePaymentDto, businessId: string, actorUserId: string) {
    const paidAmount = this.normalizePaidAmount(
      dto.paidAmount ?? (dto.status === 'Paid' ? dto.amount : 0),
    );
    const status = this.resolveStatus(dto.amount, paidAmount, dto.status);
    const payment = await this.prisma.payment.create({
      data: {
        businessId,
        customerId: dto.customerId,
        appointmentId: dto.appointmentId,
        amount: dto.amount,
        paidAmount,
        status,
        method: dto.method,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : status === 'Paid' ? new Date() : undefined,
      },
      include: { customer: true, appointment: true },
    });
    await this.audit.log({
      businessId,
      actorUserId,
      model: 'Payment',
      modelId: payment.id,
      action: 'CREATE',
      description: `Created payment ${payment.amount}`,
      changes: dto,
    });
    return normalizeNestedCustomer(payment);
  }

  async update(id: string, dto: UpdatePaymentDto, businessId: string, actorUserId: string) {
    const existing = await this.ensureExists(id, businessId);
    const amount = dto.amount ?? existing.amount;
    const paidAmount = this.normalizePaidAmount(
      dto.paidAmount ??
        (dto.status === 'Paid'
          ? amount
          : dto.status === 'Unpaid'
            ? 0
            : existing.paidAmount),
    );
    const status = this.resolveStatus(amount, paidAmount, dto.status);
    const payment = await this.prisma.payment.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        appointmentId: dto.appointmentId,
        amount: dto.amount,
        paidAmount,
        status,
        method: dto.method,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        paidAt: dto.paidAt
          ? new Date(dto.paidAt)
          : status === 'Paid'
            ? new Date()
            : null,
      },
      include: { customer: true, appointment: true },
    });
    await this.audit.log({
      businessId,
      actorUserId,
      model: 'Payment',
      modelId: payment.id,
      action: 'UPDATE',
      description: `Updated payment ${payment.amount}`,
      changes: dto,
    });
    return normalizeNestedCustomer(payment);
  }

  private resolveStatus(amount: number, paidAmount: number, requested?: string) {
    if (requested === 'Refunded') {
      return 'Refunded';
    }
    if (paidAmount >= amount) {
      return 'Paid';
    }
    if (paidAmount > 0 && paidAmount < amount) {
      return 'Partial';
    }
    return requested && requested !== 'Paid' && requested !== 'Partial'
      ? requested
      : 'Unpaid';
  }

  private normalizePaidAmount(paidAmount: number) {
    return Math.max(paidAmount, 0);
  }

  private async ensureExists(id: string, businessId: string) {
    const payment = await this.prisma.payment.findFirst({ where: { id, businessId } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }
}
