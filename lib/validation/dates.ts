export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export function dateBounds(now = new Date()) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const [year, month, day] = today.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year + 1, month, 0)).getUTCDate();
  const maximum = `${year + 1}-${String(month).padStart(2, "0")}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
  return { today, maximum };
}
export function getTripMonths(departure: string, returnDate: string): number[] {
  if (
    !isValidDate(departure) ||
    !isValidDate(returnDate) ||
    returnDate <= departure
  )
    return [];
  const cursor = new Date(`${departure.slice(0, 7)}-01T12:00:00Z`);
  const end = new Date(`${returnDate}T12:00:00Z`);
  const months = new Set<number>();
  while (cursor <= end && months.size < 12) {
    months.add(cursor.getUTCMonth() + 1);
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return [...months];
}
