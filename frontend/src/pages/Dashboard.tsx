import { AlertCircle, CalendarClock, Flame, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { LeadModal } from '../components/LeadModal';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { currency, shortDate } from '../lib/format';
import type { DashboardSummary } from '../types';

export function Dashboard({
  summary,
  refresh,
  notify,
}: {
  summary?: DashboardSummary;
  refresh: () => Promise<void>;
  notify: (message: string) => void;
}) {
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  if (!summary) {
    return <div className="empty-state">Loading workspace...</div>;
  }

  return (
    <div className="screen-stack">
      <div className="stats-grid">
        <StatCard label="All" value={summary.totals.totalLeads ?? summary.totals.openLeads} accent="blue" />
        <StatCard label="Today" value={summary.totals.todayLeads ?? summary.totals.todayAppointments} accent="green" />
        <StatCard label="Follow-ups" value={summary.totals.followUpLeads ?? summary.totals.overdueFollowUps} accent="orange" />
        <StatCard label="Receivable" value={currency(summary.totals.receivables)} accent="red" />
      </div>

      <button className="primary-action" type="button" onClick={() => setLeadModalOpen(true)}>
        <PlusCircle size={19} />
        Add lead
      </button>

      <section className="panel">
        <div className="section-title">
          <CalendarClock size={18} />
          <h2>Today’s leads</h2>
        </div>
        {(summary.todayLeads ?? []).length === 0 ? (
          <p className="muted">No new leads today.</p>
        ) : (
          <div className="item-list">
            {summary.todayLeads.map((lead) => (
              <article className="list-row" key={lead.id}>
                <div>
                  <strong>{lead.customer.name}</strong>
                  <p>{lead.serviceType}</p>
                </div>
                <StatusBadge label={lead.status} tone={lead.status === 'Booked' ? 'good' : 'neutral'} />
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-title">
          <Flame size={18} />
          <h2>Hot leads</h2>
        </div>
        <div className="item-list">
          {summary.hotLeads.map((lead) => (
            <article className="list-row" key={lead.id}>
              <div>
                <strong>{lead.customer.name}</strong>
                <p>{lead.serviceType}</p>
              </div>
              <StatusBadge label={lead.urgency} tone="hot" />
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-title">
          <AlertCircle size={18} />
          <h2>Needs attention</h2>
        </div>
        <div className="item-list">
          {(summary.followUpLeads ?? []).map((lead) => (
            <article className="list-row" key={lead.id}>
              <div>
                <strong>{lead.customer.name}</strong>
                <p>{lead.serviceType}</p>
              </div>
              <span>{shortDate(lead.nextFollowUpDate)}</span>
            </article>
          ))}
        </div>
      </section>

      <LeadModal
        open={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        onCreated={async () => {
          await refresh();
          notify('Lead captured successfully');
        }}
      />
    </div>
  );
}
