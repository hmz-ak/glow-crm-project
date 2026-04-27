import { CheckCircle2, Copy, Send, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { pageItems, Pagination } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../lib/api';
import { isPast, shortDate } from '../lib/format';
import type { FollowUpTask } from '../types';

const messageIntents = ['win-back', 'booking-reminder', 'thank-you'] as const;
const filters = ['All', 'Open', 'Done', 'Skipped'] as const;
const pageSize = 6;

export function FollowUps({
  followUps,
  refresh,
}: {
  followUps: FollowUpTask[];
  refresh: () => Promise<void>;
}) {
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [copyNotice, setCopyNotice] = useState('');
  const [variants, setVariants] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [page, setPage] = useState(1);

  const filteredFollowUps = useMemo(
    () => followUps.filter((task) => (filter === 'All' ? true : task.status === filter)),
    [filter, followUps],
  );
  const visibleFollowUps = useMemo(
    () => pageItems(filteredFollowUps, page, pageSize),
    [filteredFollowUps, page],
  );

  useEffect(() => {
    setPage(1);
  }, [filter]);

  async function complete(id: string) {
    await api.updateFollowUpStatus(id, 'Done');
    await refresh();
  }

  async function generate(task: FollowUpTask) {
    const nextVariant = (variants[task.id] ?? 0) + 1;
    const intent =
      task.reason.toLowerCase().includes('payment')
        ? 'payment-due'
        : messageIntents[nextVariant % messageIntents.length];
    const result = await api.suggestMessage({
      customerName: task.customer.name,
      serviceType: task.lead?.serviceType ?? task.reason,
      intent,
      businessName: 'Glow Studio',
    });
    setMessages((current) => ({ ...current, [task.id]: result.message }));
    setVariants((current) => ({ ...current, [task.id]: nextVariant }));
  }

  async function copy(task: FollowUpTask) {
    const message = messages[task.id] ?? task.suggestedMessage;
    await navigator.clipboard.writeText(message);
    setCopyNotice(`Copied message for ${task.customer.name}`);
    window.setTimeout(() => setCopyNotice(''), 2200);
  }

  async function send(task: FollowUpTask) {
    const message = messages[task.id] ?? task.suggestedMessage;
    const phone = task.customer.phone.replace(/[^\d]/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    await complete(task.id);
  }

  return (
    <div className="screen-stack">
      {copyNotice && <div className="inline-toast">{copyNotice}</div>}
      <label className="filter-select">
        Follow-up filter
        <select value={filter} onChange={(event) => setFilter(event.target.value as (typeof filters)[number])}>
          {filters.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      {visibleFollowUps.map((task) => (
        <article className={`task-card ${isPast(task.dueAt) && task.status === 'Open' ? 'task-overdue' : ''}`} key={task.id}>
          <div className="task-head">
            <div>
              <strong>{task.customer.name}</strong>
              <p>{task.reason}</p>
            </div>
            <StatusBadge
              label={task.status === 'Open' && isPast(task.dueAt) ? 'Overdue' : task.status}
              tone={task.status === 'Done' ? 'good' : isPast(task.dueAt) ? 'danger' : 'warn'}
            />
          </div>
          <p className="message-box">{messages[task.id] ?? task.suggestedMessage}</p>
          <div className="task-actions">
            <span>{shortDate(task.dueAt)}</span>
            <button className="icon-button" type="button" onClick={() => generate(task)} title="Generate message">
              <Sparkles size={17} />
            </button>
            <button className="icon-button" type="button" onClick={() => copy(task)} title="Copy message">
              <Copy size={17} />
            </button>
            <button className="icon-button" type="button" onClick={() => send(task)} title="Send on WhatsApp">
              <Send size={17} />
            </button>
            <button className="icon-button" type="button" onClick={() => complete(task.id)} title="Complete">
              <CheckCircle2 size={17} />
            </button>
          </div>
        </article>
      ))}
      <Pagination page={page} pageSize={pageSize} total={filteredFollowUps.length} onPageChange={setPage} />
    </div>
  );
}
