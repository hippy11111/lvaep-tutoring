export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function parseMonth(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return { year, month, start, end };
}

export function formatMonthLabel(value: string) {
  const parsed = parseMonth(value);
  if (!parsed) return value;
  return parsed.start.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function fiscalYearRange(ref = new Date()) {
  const year = ref.getUTCFullYear();
  const month = ref.getUTCMonth();
  const startYear = month >= 6 ? year : year - 1;
  return {
    start: new Date(Date.UTC(startYear, 6, 1)),
    end: new Date(Date.UTC(startYear + 1, 6, 1)),
    label: `FY ${startYear}–${startYear + 1}`,
  };
}
