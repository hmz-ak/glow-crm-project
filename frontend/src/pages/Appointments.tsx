import { CalendarCheck2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { pageItems, Pagination } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../lib/api';
import { currency, shortDate } from '../lib/format';
import type { Appointment, Lead, LeadStatus } from '../types';

const leadStatuses: LeadStatus[] = ['New', 'Contacted', 'Booked', 'Served', 'Follow-up', 'Won', 'Lost'];
const filters = ['All', ...leadStatuses] as const;
const pageSize = 6;

export function Appointments({
  appointments,
  leads,
  refresh,
}: {
  appointments: Appointment[];
  leads: Lead[];
  refresh: () => Promise<void>;
}) {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [page, setPage] = useState(1);

  const bookingRows = useMemo(
    () => [
      ...leads.map((lead) => {
        const appointment =
          lead.appointments?.[0] ??
          appointments.find((item) => item.leadId === lead.id);
        return {
          type: 'lead' as const,
          id: lead.id,
          leadId: lead.id,
          customer: lead.customer,
          service: lead.serviceType,
          status: lead.status,
          meta: appointment
            ? `${shortDate(appointment.scheduledAt)} · ${currency(appointment.price)}`
            : `Lead value ${currency(lead.valueEstimate)} · slot not scheduled`,
        };
      }),
      ...appointments
        .filter((appointment) => !appointment.leadId)
        .map((appointment) => ({
          type: 'appointment' as const,
          id: appointment.id,
          customer: appointment.customer,
          service: appointment.service,
          status: appointment.status as LeadStatus,
          meta: `${shortDate(appointment.scheduledAt)} · ${currency(appointment.price)}`,
        })),
    ],
    [appointments, leads],
  );

  const filteredRows = useMemo(
    () => bookingRows.filter((row) => (filter === 'All' ? true : row.status === filter)),
    [bookingRows, filter],
  );
  const visibleRows = useMemo(() => pageItems(filteredRows, page, pageSize), [filteredRows, page]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  async function update(row: { id: string; leadId?: string; type: 'appointment' | 'lead' }, status: LeadStatus) {
    if (row.leadId) {
      await api.updateLeadStatus(row.leadId, status);
    } else {
      await api.updateAppointmentStatus(row.id, status);
    }
    await refresh();
  }

  return (
    <div className="screen-stack">
      <section className="panel">
        <div className="section-title">
          <CalendarCheck2 size={18} />
          <h2>Bookings</h2>
        </div>
        <label className="filter-select">
          Booking filter
          <select value={filter} onChange={(event) => setFilter(event.target.value as (typeof filters)[number])}>
            {filters.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <div className="item-list">
          {visibleRows.map((row) => (
            <article className="list-row booking-row" key={`${row.type}-${row.id}`}>
              <div>
                <strong>{row.customer.name}</strong>
                <p>{row.service}</p>
                <span>{row.meta}</span>
              </div>
              <div className="row-actions">
                <StatusBadge
                  label={row.status}
                  tone={row.status === 'Won' || row.status === 'Booked' ? 'good' : row.status === 'Lost' ? 'danger' : 'neutral'}
                />
                <select value={row.status} onChange={(event) => update(row, event.target.value as LeadStatus)}>
                  {leadStatuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>
            </article>
          ))}
        </div>
        <Pagination page={page} pageSize={pageSize} total={filteredRows.length} onPageChange={setPage} />
      </section>
    </div>
  );
}
