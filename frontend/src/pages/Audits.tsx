import { useEffect, useMemo, useState } from 'react';
import { pageItems, Pagination } from '../components/Pagination';
import { shortDate } from '../lib/format';
import type { AuditLog } from '../types';

const pageSize = 8;
const filters = ['All', 'Customer', 'Lead', 'Appointment', 'Payment', 'FollowUpTask', 'Business'] as const;

export function Audits({ audits }: { audits: AuditLog[] }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [page, setPage] = useState(1);
  const filtered = useMemo(
    () => audits.filter((audit) => (filter === 'All' ? true : audit.model === filter)),
    [audits, filter],
  );
  const visible = useMemo(() => pageItems(filtered, page, pageSize), [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  return (
    <div className="screen-stack">
      <section className="panel">
        <div className="section-title">
          <h2>Activity audit</h2>
        </div>
        <label className="filter-select">
          Model filter
          <select value={filter} onChange={(event) => setFilter(event.target.value as (typeof filters)[number])}>
            {filters.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <div className="item-list">
          {visible.map((audit) => (
            <article className="list-row audit-row" key={audit.id}>
              <div>
                <strong>{audit.description}</strong>
                <p>
                  {audit.model} · {audit.action} · {audit.actor?.name ?? 'System'}
                </p>
              </div>
              <span>{shortDate(audit.createdAt)}</span>
            </article>
          ))}
        </div>
        <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
      </section>
    </div>
  );
}
