import type { TempFormat } from '../types/weather';

export function formatTemperature(
  fahrenheit: number | undefined,
  format: TempFormat,
): string {
  if (fahrenheit == null) return '--';
  if (format === 'c') {
    return String(Math.round(((fahrenheit - 32) * 5) / 9));
  }
  return String(Math.round(fahrenheit));
}
