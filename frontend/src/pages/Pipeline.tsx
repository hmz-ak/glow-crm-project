import { LayoutGrid, Table2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { pageItems, Pagination } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../lib/api';
import { currency, shortDate } from '../lib/format';
import type { Lead, LeadStatus } from '../types';

const statuses: LeadStatus[] = ['New', 'Contacted', 'Booked', 'Served', 'Follow-up', 'Won', 'Lost'];
const filters = ['All', ...statuses] as const;
const pageSize = 8;

export function Pipeline({ leads, refresh }: { leads: Lead[]; refresh: () => Promise<void> }) {
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [page, setPage] = useState(1);

  const filteredLeads = useMemo(
    () => leads.filter((lead) => (filter === 'All' ? true : lead.status === filter)),
    [filter, leads],
  );
  const visibleLeads = useMemo(() => pageItems(filteredLeads, page, pageSize), [filteredLeads, page]);

  const grouped = useMemo(
    () =>
      statuses.map((status) => ({
        status,
        leads: visibleLeads.filter((lead) => lead.status === status),
      })),
    [visibleLeads],
  );

  useEffect(() => {
    setPage(1);
  }, [filter, view]);

  async function changeStatus(id: string, status: LeadStatus) {
    await api.updateLeadStatus(id, status);
    await refresh();
  }

  return (
    <div className="screen-stack">
      <div className="view-toolbar">
        <div>
          <p className="eyebrow">Pipeline</p>
          <h2>Lead board</h2>
        </div>
        <div className="segmented-control" aria-label="Pipeline view">
          <button className={view === 'cards' ? 'active' : ''} type="button" onClick={() => setView('cards')}>
            <LayoutGrid size={16} />
            Cards
          </button>
          <button className={view === 'table' ? 'active' : ''} type="button" onClick={() => setView('table')}>
            <Table2 size={16} />
            Table
          </button>
        </div>
      </div>
      <label className="filter-select">
        Status filter
        <select value={filter} onChange={(event) => setFilter(event.target.value as (typeof filters)[number])}>
          {filters.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>

      {view === 'cards' ? (
        <>
          <div className="pipeline-strip">
            {grouped.map(({ status, leads: statusLeads }) => (
              <section className="pipeline-column" key={status}>
                <div className="column-title">
                  <h2>{status}</h2>
                  <span>{statusLeads.length}</span>
                </div>
                {statusLeads.map((lead) => (
                  <article className="lead-card" key={lead.id}>
                    <div className="lead-card-head">
                      <strong>{lead.customer.name}</strong>
                      <StatusBadge label={lead.urgency} tone={lead.urgency === 'Hot' ? 'hot' : 'neutral'} />
                    </div>
                    <p>{lead.serviceType}</p>
                    <div className="lead-meta">
                      <span>{currency(lead.valueEstimate)}</span>
                      <span>{lead.source}</span>
                    </div>
                    <div className="lead-meta">
                      <span>{shortDate(lead.nextFollowUpDate)}</span>
                    </div>
                    <select value={lead.status} onChange={(event) => changeStatus(lead.id, event.target.value as LeadStatus)}>
                      {statuses.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </article>
                ))}
              </section>
            ))}
          </div>
          <Pagination page={page} pageSize={pageSize} total={filteredLeads.length} onPageChange={setPage} />
        </>
      ) : (
        <section className="panel table-panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Service</th>
                <th>Status</th>
                <th>Value</th>
                <th>Source</th>
                <th>Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {visibleLeads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <strong>{lead.customer.name}</strong>
                    <span>{lead.customer.phone}</span>
                  </td>
                  <td>{lead.serviceType}</td>
                  <td>
                    <select value={lead.status} onChange={(event) => changeStatus(lead.id, event.target.value as LeadStatus)}>
                      {statuses.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </td>
                  <td>{currency(lead.valueEstimate)}</td>
                  <td>{lead.source}</td>
                  <td>{shortDate(lead.nextFollowUpDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} pageSize={pageSize} total={filteredLeads.length} onPageChange={setPage} />
        </section>
      )}
    </div>
  );
}
