export function parseTags(tags?: string | null): string[] {
  if (!tags) {
    return [];
  }

  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function serializeTags(tags?: string[]): string | undefined {
  return tags ? JSON.stringify(tags) : undefined;
}

export function normalizeCustomer<T extends { tags?: string | null }>(
  customer: T,
): Omit<T, 'tags'> & { tags: string[] } {
  return {
    ...customer,
    tags: parseTags(customer.tags),
  };
}

export function normalizeNestedCustomer<T extends { customer?: any }>(
  record: T,
) {
  return record.customer
    ? { ...record, customer: normalizeCustomer(record.customer) }
    : record;
}
