import { FormEvent, useState } from 'react';
import { SendHorizonal, X } from 'lucide-react';
import { api } from '../lib/api';

type LeadModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
};

export function LeadModal({ open, onClose, onCreated }: LeadModalProps) {
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    source: 'Instagram DM',
    serviceType: '',
    valueEstimate: '',
    urgency: 'Hot' as 'Low' | 'Normal' | 'Hot',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  if (!open) {
    return null;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.createLead({
        ...form,
        valueEstimate: form.valueEstimate ? Number(form.valueEstimate) : undefined,
      });
      setForm({
        customerName: '',
        customerPhone: '',
        source: 'Instagram DM',
        serviceType: '',
        valueEstimate: '',
        urgency: 'Hot',
        notes: '',
      });
      await onCreated();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title">
      <form className="modal-card" onSubmit={submit}>
        <div className="modal-head">
          <div>
            <p className="eyebrow">New lead</p>
            <h2 id="lead-modal-title">Capture request</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} title="Close">
            <X size={17} />
          </button>
        </div>

        <div className="form-grid">
          <label>
            Client
            <input
              required
              value={form.customerName}
              onChange={(event) => setForm({ ...form, customerName: event.target.value })}
              placeholder="Name"
            />
          </label>
          <label>
            Phone
            <input
              required
              value={form.customerPhone}
              onChange={(event) => setForm({ ...form, customerPhone: event.target.value })}
              placeholder="+92..."
            />
          </label>
          <label>
            Service
            <input
              required
              value={form.serviceType}
              onChange={(event) => setForm({ ...form, serviceType: event.target.value })}
              placeholder="Deep clean, haircut..."
            />
          </label>
          <label>
            Estimate
            <input
              type="number"
              value={form.valueEstimate}
              onChange={(event) => setForm({ ...form, valueEstimate: event.target.value })}
              placeholder="12000"
            />
          </label>
          <label>
            Source
            <select value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })}>
              <option>Instagram DM</option>
              <option>WhatsApp</option>
              <option>Google Business</option>
              <option>Referral</option>
              <option>Walk-in</option>
            </select>
          </label>
          <label>
            Urgency
            <select
              value={form.urgency}
              onChange={(event) => setForm({ ...form, urgency: event.target.value as 'Low' | 'Normal' | 'Hot' })}
            >
              <option>Hot</option>
              <option>Normal</option>
              <option>Low</option>
            </select>
          </label>
        </div>

        <label>
          Notes
          <textarea
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            placeholder="Timing, preference, budget..."
          />
        </label>

        <button className="primary-action" type="submit" disabled={saving}>
          <SendHorizonal size={18} />
          {saving ? 'Saving...' : 'Capture lead'}
        </button>
      </form>
    </div>
  );
}
