import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audits/audit.service';
import { normalizeNestedCustomer } from '../common/serializers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(businessId: string) {
    const appointments = await this.prisma.appointment.findMany({
      where: { businessId },
      include: { customer: true, lead: true, payments: true },
      orderBy: { scheduledAt: 'asc' },
    });
    return appointments.map(normalizeNestedCustomer);
  }

  async create(dto: CreateAppointmentDto, businessId: string, actorUserId: string) {
    const appointment = await this.prisma.appointment.create({
      data: {
        businessId,
        customerId: dto.customerId,
        leadId: dto.leadId,
        service: dto.service,
        scheduledAt: new Date(dto.scheduledAt),
        status: dto.status ?? 'Booked',
        price: dto.price,
        notes: dto.notes,
      },
      include: { customer: true, lead: true, payments: true },
    });

    if (dto.leadId) {
      await this.prisma.lead.update({
        where: { id: dto.leadId },
        data: { status: 'Booked', businessId },
      });
    }

    await this.audit.log({
      businessId,
      actorUserId,
      model: 'Appointment',
      modelId: appointment.id,
      action: 'CREATE',
      description: `Created appointment ${appointment.service}`,
      changes: dto,
    });
    return normalizeNestedCustomer(appointment);
  }

  async update(id: string, dto: UpdateAppointmentDto, businessId: string, actorUserId: string) {
    await this.ensureExists(id, businessId);
    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        leadId: dto.leadId,
        service: dto.service,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        status: dto.status,
        price: dto.price,
        notes: dto.notes,
      },
      include: { customer: true, lead: true, payments: true },
    });
    await this.audit.log({
      businessId,
      actorUserId,
      model: 'Appointment',
      modelId: appointment.id,
      action: 'UPDATE',
      description: `Updated appointment ${appointment.service}`,
      changes: dto,
    });
    return normalizeNestedCustomer(appointment);
  }

  private async ensureExists(id: string, businessId: string) {
    const appointment = await this.prisma.appointment.findFirst({ where: { id, businessId } });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
  }
}
