import { environment } from '../environment';

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const isPast = (d: string) => new Date(d) < new Date();
const formatPrice = (p: number) => `$${p.toLocaleString()}`;

export { formatDate, formatPrice, isPast };

export function combineDateAndTime(date: string, time: string): string {
  const [timePart, meridiem] = time.split(' ');
  const [hourStr, minuteStr] = timePart.split(':');
  let hours = Number(hourStr);
  const minutes = Number(minuteStr);
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString();
}

/**
 * Resolve photographer / media image paths.
 * - Uploaded files: `/uploads/...` → `{apiBase}/uploads/...`
 * - Absolute URLs: returned as-is
 * - Seeded Unsplash ids: `photo-...` → images.unsplash.com/...
 */
export function mediaUrl(
  path: string | null | undefined,
  opts?: { w?: number; h?: number; face?: boolean },
): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) {
    return `${environment.apiBase}${path}`;
  }
  const w = opts?.w ?? 800;
  const h = opts?.h ?? 600;
  const face = opts?.face ? '&face' : '';
  return `https://images.unsplash.com/${path}?w=${w}&h=${h}&fit=crop&auto=format${face}`;
}
