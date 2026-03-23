import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy');
}

export function formatDateShort(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yy');
}

export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return format(date, 'MMM yyyy');
}

export function getDateRangePreset(preset: string): { startDate: string; endDate: string } {
  const now = new Date();
  const end = format(endOfMonth(now), 'yyyy-MM-dd');

  switch (preset) {
    case 'this-month':
      return {
        startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
        endDate: end,
      };
    case 'last-3-months':
      return {
        startDate: format(startOfMonth(subMonths(now, 2)), 'yyyy-MM-dd'),
        endDate: end,
      };
    case 'last-6-months':
      return {
        startDate: format(startOfMonth(subMonths(now, 5)), 'yyyy-MM-dd'),
        endDate: end,
      };
    case 'last-year':
      return {
        startDate: format(startOfMonth(subMonths(now, 11)), 'yyyy-MM-dd'),
        endDate: end,
      };
    default:
      return {
        startDate: format(startOfMonth(subMonths(now, 2)), 'yyyy-MM-dd'),
        endDate: end,
      };
  }
}
