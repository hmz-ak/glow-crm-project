type StatCardProps = {
  label: string;
  value: string | number;
  accent?: string;
};

export function StatCard({ label, value, accent = 'ink' }: StatCardProps) {
  return (
    <section className={`stat-card accent-${accent}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </section>
  );
}
