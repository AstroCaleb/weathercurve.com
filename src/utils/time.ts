import { format, fromUnixTime } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import type { TimeFormat } from '../types/weather';

export function formatHour(
  unixTime: number,
  timeFormat: TimeFormat,
  timezone?: string,
): string {
  const date = fromUnixTime(unixTime);
  const zonedDate = timezone ? toZonedTime(date, timezone) : date;
  return timeFormat === '24'
    ? format(zonedDate, 'HH')
    : format(zonedDate, 'ha').toLowerCase();
}

export function formatTime(
  unixTime: number,
  timeFormat: TimeFormat,
  timezone?: string,
): string {
  const date = fromUnixTime(unixTime);
  const zonedDate = timezone ? toZonedTime(date, timezone) : date;
  return timeFormat === '24'
    ? format(zonedDate, 'HH:mm')
    : format(zonedDate, 'h:mm a').toLowerCase();
}

export function formatDate(unixTime: number, timezone?: string): string {
  const date = fromUnixTime(unixTime);
  const zonedDate = timezone ? toZonedTime(date, timezone) : date;
  return format(zonedDate, 'EEEE, MMMM d');
}

export function formatShortDate(unixTime: number, timezone?: string): string {
  const date = fromUnixTime(unixTime);
  const zonedDate = timezone ? toZonedTime(date, timezone) : date;
  return format(zonedDate, 'EEE, d');
}

export function getHourNumber(unixTime: number, timezone?: string): number {
  const date = fromUnixTime(unixTime);
  const zonedDate = timezone ? toZonedTime(date, timezone) : date;
  return zonedDate.getHours();
}

export function isMidnight(unixTime: number, timezone?: string): boolean {
  return getHourNumber(unixTime, timezone) === 0;
}
