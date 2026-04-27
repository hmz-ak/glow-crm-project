type StatusBadgeProps = {
  label: string;
  tone?: 'neutral' | 'good' | 'warn' | 'danger' | 'hot';
};

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  return <span className={`status status-${tone}`}>{label}</span>;
}
