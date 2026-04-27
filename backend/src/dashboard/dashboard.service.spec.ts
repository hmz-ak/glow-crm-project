import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  it('summarizes today, overdue work, and revenue buckets', async () => {
    const now = new Date();
    const prisma = {
      customer: { count: jest.fn().mockResolvedValue(3) },
      lead: {
        count: jest.fn().mockResolvedValue(2),
        findMany: jest
          .fn()
          .mockResolvedValueOnce([{ id: 'lead-today', customer: { tags: '[]' } }])
          .mockResolvedValueOnce([{ id: 'lead-follow', status: 'Follow-up', customer: { tags: '[]' } }])
          .mockResolvedValueOnce([{ id: 'lead-1', urgency: 'Hot', customer: { tags: '[]' } }])
          .mockResolvedValueOnce([{ id: 'lead-2', customer: { tags: '[]' } }])
          .mockResolvedValueOnce([]),
      },
      appointment: {
        findMany: jest.fn().mockResolvedValue([{ id: 'appt-1', scheduledAt: now, customer: { tags: '[]' } }]),
      },
      followUpTask: {
        findMany: jest.fn().mockResolvedValue([{ id: 'follow-1', dueAt: now, customer: { tags: '[]' } }]),
      },
      payment: {
        findMany: jest
          .fn()
          .mockResolvedValueOnce([{ id: 'payment-1', amount: 5000, status: 'Unpaid', customer: { tags: '[]' } }])
          .mockResolvedValueOnce([
            { amount: 9000, paidAmount: 9000, status: 'Paid' },
            { amount: 5000, paidAmount: 0, status: 'Unpaid' },
          ]),
      },
    };

    const service = new DashboardService(prisma as any);
    const summary = await service.summary('business-1');

    expect(summary.totals.customers).toBe(3);
    expect(summary.totals.totalLeads).toBe(2);
    expect(summary.totals.todayLeads).toBe(1);
    expect(summary.totals.followUpLeads).toBe(1);
    expect(summary.totals.hotLeads).toBe(1);
    expect(summary.totals.todayAppointments).toBe(1);
    expect(summary.totals.paidRevenue).toBe(9000);
    expect(summary.totals.receivables).toBe(5000);
  });
});
