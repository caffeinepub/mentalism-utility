const MONTH_NAMES: Record<string, number> = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sep: 9,
  sept: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
};

export function parseDate(input: string): Date | null {
  const clean = input.trim().replace(/[^a-zA-Z0-9 ]/g, "");

  // Format 1: DDMMYYYY (8 digits)
  const digits = clean.replace(/\s/g, "");
  if (/^\d{8}$/.test(digits)) {
    const day = Number.parseInt(digits.slice(0, 2), 10);
    const month = Number.parseInt(digits.slice(2, 4), 10);
    const year = Number.parseInt(digits.slice(4, 8), 10);
    const d = new Date(year, month - 1, day);
    if (isValidDate(d, day, month, year)) return d;
  }

  // Format 2: DD MM YYYY (three space-separated numbers)
  const numParts = clean.split(/\s+/).filter((p) => /^\d+$/.test(p));
  if (numParts.length === 3) {
    const day = Number.parseInt(numParts[0], 10);
    const month = Number.parseInt(numParts[1], 10);
    const year = Number.parseInt(numParts[2], 10);
    const d = new Date(year, month - 1, day);
    if (isValidDate(d, day, month, year)) return d;
  }

  // Format 3: DD Month YYYY
  const parts = clean.split(/\s+/);
  if (parts.length >= 3) {
    for (let i = 0; i < parts.length - 2; i++) {
      const dayStr = parts[i];
      const monthStr = parts[i + 1];
      const yearStr = parts[i + 2];
      if (!/^\d{1,2}$/.test(dayStr)) continue;
      if (!/^\d{4}$/.test(yearStr)) continue;
      const monthNum = MONTH_NAMES[monthStr.toLowerCase()];
      if (!monthNum) continue;
      const day = Number.parseInt(dayStr, 10);
      const year = Number.parseInt(yearStr, 10);
      const d = new Date(year, monthNum - 1, day);
      if (isValidDate(d, day, monthNum, year)) return d;
    }
  }

  return null;
}

function isValidDate(
  d: Date,
  day: number,
  month: number,
  year: number,
): boolean {
  return (
    !Number.isNaN(d.getTime()) &&
    d.getDate() === day &&
    d.getMonth() === month - 1 &&
    d.getFullYear() === year &&
    year >= 1900 &&
    year <= 2100
  );
}
