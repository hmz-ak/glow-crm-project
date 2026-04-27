export function currency(value?: number) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

export function shortDate(value?: string) {
  if (!value) {
    return 'No date';
  }
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function isPast(value: string) {
  return new Date(value).getTime() < Date.now();
}
