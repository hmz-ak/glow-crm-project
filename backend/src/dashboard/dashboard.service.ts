import { Injectable } from '@nestjs/common';
import { normalizeNestedCustomer } from '../common/serializers';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(businessId: string) {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const [
      totalCustomers,
      totalLeads,
      todayLeads,
      followUpLeads,
      openLeads,
      hotLeads,
      todayAppointments,
      overdueFollowUps,
      unpaidPayments,
      payments,
      recentLeads,
      allLeads,
    ] = await Promise.all([
      this.prisma.customer.count({ where: { businessId } }),
      this.prisma.lead.count({ where: { businessId } }),
      this.prisma.lead.findMany({
        where: { businessId, createdAt: { gte: startOfToday, lte: endOfToday } },
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.lead.findMany({
        where: { businessId, status: 'Follow-up' },
        include: { customer: true },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      this.prisma.lead.count({ where: { businessId, status: { notIn: ['Won', 'Lost'] } } }),
      this.prisma.lead.findMany({
        where: { businessId, urgency: 'Hot', status: { notIn: ['Won', 'Lost'] } },
        include: { customer: true },
        orderBy: { updatedAt: 'desc' },
        take: 4,
      }),
      this.prisma.appointment.findMany({
        where: { businessId, scheduledAt: { gte: startOfToday, lte: endOfToday } },
        include: { customer: true },
        orderBy: { scheduledAt: 'asc' },
      }),
      this.prisma.followUpTask.findMany({
        where: { businessId, status: 'Open', dueAt: { lt: now } },
        include: { customer: true, lead: true },
        orderBy: { dueAt: 'asc' },
        take: 5,
      }),
      this.prisma.payment.findMany({
        where: { businessId, status: { in: ['Unpaid', 'Partial'] } },
        include: { customer: true, appointment: true },
        orderBy: { dueAt: 'asc' },
      }),
      this.prisma.payment.findMany({ where: { businessId } }),
      this.prisma.lead.findMany({
        where: { businessId },
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.lead.findMany({
        where: { businessId },
        include: { customer: true },
      }),
    ]);

    const paidRevenue = payments
      .filter((payment) => ['Paid', 'Partial'].includes(payment.status))
      .reduce((total, payment) => total + payment.paidAmount, 0);
    const receivables = payments
      .filter((payment) => ['Unpaid', 'Partial'].includes(payment.status))
      .reduce((total, payment) => total + Math.max(payment.amount - payment.paidAmount, 0), 0);
    const unpaidLeadEstimates = allLeads
      .filter(
        (lead) =>
          lead.valueEstimate &&
          lead.valueEstimate > 0 &&
          !payments.some(
            (payment) =>
              payment.customerId === lead.customerId &&
              Math.round(payment.amount) === Math.round(lead.valueEstimate ?? 0),
          ),
      )
      .reduce((total, lead) => total + (lead.valueEstimate ?? 0), 0);

    return {
      totals: {
        customers: totalCustomers,
        totalLeads,
        todayLeads: todayLeads.length,
        followUpLeads: followUpLeads.length,
        openLeads,
        hotLeads: hotLeads.length,
        todayAppointments: todayAppointments.length,
        overdueFollowUps: overdueFollowUps.length,
        unpaidPayments: unpaidPayments.length,
        paidRevenue,
        receivables: receivables + unpaidLeadEstimates,
      },
      todayAppointments: todayAppointments.map(normalizeNestedCustomer),
      todayLeads: todayLeads.map(normalizeNestedCustomer),
      followUpLeads: followUpLeads.map(normalizeNestedCustomer),
      hotLeads: hotLeads.map(normalizeNestedCustomer),
      overdueFollowUps: overdueFollowUps.map(normalizeNestedCustomer),
      unpaidPayments: unpaidPayments.map(normalizeNestedCustomer),
      recentLeads: recentLeads.map(normalizeNestedCustomer),
    };
  }
}
