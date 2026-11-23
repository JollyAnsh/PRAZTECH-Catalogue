/**
 * Formats any ISO string, date string, timestamp number, or Date object into DD/MM/YY format (e.g. 23/11/26).
 * Standard Indian commercial accounting format.
 */
export function formatDateDDMMYY(dateInput?: string | Date | number | null): string {
  if (!dateInput) return '';
  if (typeof dateInput === 'number') {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  }
  const str = String(dateInput).trim();
  if (!str) return '';

  // Already in DD/MM/YY or DD-MM-YY
  if (/^\d{2}[\/-]\d{2}[\/-]\d{2}$/.test(str)) {
    return str.replace(/-/g, '/');
  }

  // Already in DD/MM/YYYY or DD-MM-YYYY
  const ddmmyyyyMatch = str.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
  if (ddmmyyyyMatch) {
    return `${ddmmyyyyMatch[1]}/${ddmmyyyyMatch[2]}/${ddmmyyyyMatch[3].slice(-2)}`;
  }

  // If in YYYY-MM-DD format (standard ISO date from input)
  const yyyymmddMatch = str.match(/^(\d{4})[\/-](\d{2})[\/-](\d{2})/);
  if (yyyymmddMatch) {
    const yearYY = yyyymmddMatch[1].slice(-2);
    const month = yyyymmddMatch[2];
    const day = yyyymmddMatch[3];
    return `${day}/${month}/${yearYY}`;
  }

  const d = new Date(str);
  if (isNaN(d.getTime())) return str;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);

  return `${day}/${month}/${year}`;
}
