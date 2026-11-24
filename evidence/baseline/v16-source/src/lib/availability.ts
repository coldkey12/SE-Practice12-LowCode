import type { Booking, CheckResult, Room } from './types';

export const MAX_BOOKING_MINUTES = 120;
export const DAY_END = 1440;

export function minutesToLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function labelToMinutes(label: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(label);
  if (!match) return NaN;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h === 24 && m === 0) return 1440;
  if (h > 23 || m > 59) return NaN;
  return h * 60 + m;
}

export function resolveCurrentMinutes(entered: number, live: number): number {
  return Math.max(entered, live);
}

export function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function checkAvailability(
  room: Room | null,
  start: number,
  end: number,
  currentMinutes: number,
  bookings: Booking[]
): CheckResult {
  if (!room) {
    return { available: false, reason: 'Please select a room first.' };
  }

  // AC1: valid interval and start must be after current time
  if (!(0 <= start && start < end && end <= DAY_END)) {
    return {
      available: false,
      reason: 'Interval must have start earlier than end and fall within 00:00–24:00.',
    };
  }
  if (start <= currentMinutes) {
    return {
      available: false,
      reason: `Start time must be later than the current time (${minutesToLabel(currentMinutes)}).`,
    };
  }

  // AC2: max 120 minutes
  if (end - start > MAX_BOOKING_MINUTES) {
    return {
      available: false,
      reason: `Booking exceeds the ${MAX_BOOKING_MINUTES}-minute limit (requested ${end - start} min).`,
    };
  }

  // AC3: room blocked
  if (room.blocked) {
    return { available: false, reason: 'This room is currently blocked and cannot be booked.' };
  }

  // AC4: no overlap with existing bookings (touching allowed)
  const conflict = bookings
    .filter((b) => b.roomId === room.id)
    .find((b) => overlaps(start, end, b.start, b.end));
  if (conflict) {
    return {
      available: false,
      reason: `Overlaps with "${conflict.title}" (${minutesToLabel(conflict.start)}–${minutesToLabel(conflict.end)}).`,
    };
  }

  return { available: true };
}
