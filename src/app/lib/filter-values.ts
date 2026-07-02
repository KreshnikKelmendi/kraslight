function isAllCaps(value: string): boolean {
  return value === value.toUpperCase() && /[a-zA-Z]/.test(value);
}

function pickPreferredLabel(labels: string[]): string {
  const preferred = labels.filter((label) => !isAllCaps(label));
  const pool = preferred.length > 0 ? preferred : labels;
  return [...pool].sort((a, b) => a.localeCompare(b, 'sq', { sensitivity: 'base' }))[0];
}

/** One entry per value, ignoring case (e.g. MAGNETIKE + Magnetike → Magnetike). */
export function uniqueFilterValues(values: (string | null | undefined)[]): string[] {
  const groups = new Map<string, string[]>();

  for (const raw of values) {
    if (!raw?.trim()) continue;
    const trimmed = raw.trim();
    const key = trimmed.toLowerCase();
    const group = groups.get(key) ?? [];
    if (!group.includes(trimmed)) {
      group.push(trimmed);
    }
    groups.set(key, group);
  }

  return Array.from(groups.values())
    .map(pickPreferredLabel)
    .sort((a, b) => a.localeCompare(b, 'sq', { sensitivity: 'base' }));
}

export function matchesFilterSelection(
  productValue: string | null | undefined,
  selected: string[]
): boolean {
  if (selected.length === 0) return true;
  const key = (productValue ?? '').trim().toLowerCase();
  return selected.some((value) => value.trim().toLowerCase() === key);
}

export function matchesExactFilterSelection(
  productValue: string | null | undefined,
  selected: string | null | undefined
): boolean {
  if (!selected) return true;
  return (productValue ?? '').trim().toLowerCase() === selected.trim().toLowerCase();
}
