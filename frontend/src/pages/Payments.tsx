import { BadgeDollarSign } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { pageItems, Pagination } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../lib/api';
import { currency, shortDate } from '../lib/format';
import type { Lead, Payment } from '../types';

const filters = ['All', 'Unpaid', 'Partial', 'Paid'] as const;
const pageSize = 6;

export function Payments({
  payments,
  leads,
  refresh,
}: {
  payments: Payment[];
  leads: Lead[];
  refresh: () => Promise<void>;
}) {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [page, setPage] = useState(1);
  const [partialFor, setPartialFor] = useState('');
  const [partialAmounts, setPartialAmounts] = useState<Record<string, string>>({});
  const [confirmPayment, setConfirmPayment] = useState<Payment | null>(null);

  const filteredPayments = useMemo(
    () => payments.filter((payment) => (filter === 'All' ? true : payment.status === filter)),
    [filter, payments],
  );

  const unpaidLeadEstimates = useMemo(
    () =>
      leads.filter(
        (lead) =>
          lead.valueEstimate &&
          lead.valueEstimate > 0 &&
          !payments.some(
            (payment) =>
              payment.customerId === lead.customerId &&
              Math.round(payment.amount) === Math.round(lead.valueEstimate ?? 0),
          ),
      ),
    [leads, payments],
  );

  const rows = useMemo(
    () => [
      ...filteredPayments.map((payment) => ({ type: 'payment' as const, payment })),
      ...((filter === 'All' || filter === 'Unpaid')
        ? unpaidLeadEstimates.map((lead) => ({ type: 'lead' as const, lead }))
        : []),
    ],
    [filter, filteredPayments, unpaidLeadEstimates],
  );
  const visibleRows = useMemo(() => pageItems(rows, page, pageSize), [page, rows]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  async function markPaid(payment: Payment) {
    await api.updatePayment(payment.id, { paidAmount: payment.amount, status: 'Paid' });
    setConfirmPayment(null);
    await refresh();
  }

  async function markPartial(payment: Payment) {
    const paidAmount = Number(partialAmounts[payment.id]);
    if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
      return;
    }
    await api.updatePayment(payment.id, { paidAmount });
    setPartialFor('');
    await refresh();
  }

  return (
    <div className="screen-stack">
      <section className="panel">
        <div className="section-title">
          <BadgeDollarSign size={18} />
          <h2>Payments</h2>
        </div>
        <label className="filter-select">
          Payment filter
          <select value={filter} onChange={(event) => setFilter(event.target.value as (typeof filters)[number])}>
            {filters.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <div className="item-list">
          {visibleRows.map((row) =>
            row.type === 'payment' ? (
              <article className="list-row payment-row" key={row.payment.id}>
                <div>
                  <strong>{row.payment.customer.name}</strong>
                  <p>{row.payment.appointment?.service ?? 'Service payment'}</p>
                  <div className="payment-breakdown">
                    <span>Total amount: {currency(row.payment.amount)}</span>
                    <span>Amount paid: {currency(row.payment.paidAmount)}</span>
                    <span>
                      Needs to be paid:{' '}
                      {currency(Math.max(row.payment.amount - row.payment.paidAmount, 0))}
                    </span>
                  </div>
                  <span>Due {shortDate(row.payment.dueAt)} · {row.payment.method ?? 'Any method'}</span>
                </div>
                <div className="row-actions">
                  <strong>{currency(row.payment.amount)}</strong>
                  <StatusBadge
                    label={row.payment.status}
                    tone={row.payment.status === 'Paid' ? 'good' : row.payment.status === 'Partial' ? 'warn' : 'danger'}
                  />
                  {row.payment.status !== 'Paid' && (
                    <>
                      <button className="small-button" type="button" onClick={() => setPartialFor(row.payment.id)}>
                        Pay partial
                      </button>
                      <button className="small-button" type="button" onClick={() => setConfirmPayment(row.payment)}>
                        Mark paid
                      </button>
                    </>
                  )}
                  {partialFor === row.payment.id && (
                    <div className="partial-box">
                      <input
                        type="number"
                        min="1"
                        value={partialAmounts[row.payment.id] ?? ''}
                        onChange={(event) =>
                          setPartialAmounts((current) => ({
                            ...current,
                            [row.payment.id]: event.target.value,
                          }))
                        }
                        placeholder="Amount paid"
                      />
                      <button className="small-button" type="button" onClick={() => markPartial(row.payment)}>
                        Save
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ) : (
              <article className="list-row payment-row" key={row.lead.id}>
                <div>
                  <strong>{row.lead.customer.name}</strong>
                  <p>{row.lead.serviceType}</p>
                  <span>Lead estimate · no payment record yet</span>
                </div>
                <div className="row-actions">
                  <strong>{currency(row.lead.valueEstimate)}</strong>
                  <StatusBadge label="Unpaid lead" tone="danger" />
                </div>
              </article>
            ),
          )}
        </div>
        <Pagination page={page} pageSize={pageSize} total={rows.length} onPageChange={setPage} />
      </section>
      {confirmPayment && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="payment-confirm-title">
          <div className="modal-card confirm-card">
            <div>
              <p className="eyebrow">Payment warning</p>
              <h2 id="payment-confirm-title">Mark full payment?</h2>
            </div>
            <p>
              This will mark the full amount of {currency(confirmPayment.amount)} as paid for{' '}
              {confirmPayment.customer.name}. This changes the remaining balance to {currency(0)}.
            </p>
            <div className="confirm-actions">
              <button className="small-button" type="button" onClick={() => setConfirmPayment(null)}>
                Cancel
              </button>
              <button className="danger-button" type="button" onClick={() => markPaid(confirmPayment)}>
                Confirm full payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
