import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { pageItems, Pagination } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';
import type { Customer } from '../types';

const pageSize = 6;

export function Customers({ customers }: { customers: Customer[] }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const filtered = useMemo(
    () =>
      customers.filter((customer) =>
        [customer.name, customer.phone, customer.email, customer.address, customer.tags.join(' ')]
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [customers, search],
  );
  const visibleCustomers = useMemo(() => pageItems(filtered, page, pageSize), [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="screen-stack">
      <label className="search-box">
        <Search size={18} />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search clients" />
      </label>
      <div className="customer-grid">
        {visibleCustomers.map((customer) => (
          <article className="customer-card" key={customer.id}>
            <div>
              <strong>{customer.name}</strong>
              <p>{customer.phone}</p>
              <p>{customer.address}</p>
            </div>
            <div className="tag-row">
              {customer.tags.map((tag) => (
                <StatusBadge key={tag} label={tag} />
              ))}
            </div>
            <div className="mini-metrics">
              <span>{customer.leads?.length ?? 0} leads</span>
              <span>{customer.appointments?.length ?? 0} bookings</span>
              <span>{customer.followUps?.filter((task) => task.status === 'Open').length ?? 0} follow-ups</span>
            </div>
          </article>
        ))}
      </div>
      <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
    </div>
  );
}
