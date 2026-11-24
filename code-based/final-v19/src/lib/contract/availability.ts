import { CONTRACT_DAY, ContractBooking } from './data';
import { ContractInput, ReasonCode, validateInput } from './validation';

export interface ContractResult {
  available: boolean;
  reasonCode: ReasonCode;
  message: string;
}

function toLabel(min: number): string {
  const h = String(Math.floor(min / 60)).padStart(2, '0');
  const m = String(min % 60).padStart(2, '0');
  return `${h}:${m}`;
}

export function minutesFromDayStart(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

// All fictional bookings are on CONTRACT_DAY; express them as absolute local
// minutes so comparisons account for both the date and the time of day.
const BOOKING_DAY_START_MIN = new Date(`${CONTRACT_DAY}T00:00`).getTime() / 60000;

// Pure: validation first, then ROOM_BLOCKED, then OVERLAP (touching edges are
// not an overlap), else AVAILABLE. Never modifies the bookings array.
export function checkContract(
  input: ContractInput,
  now: Date,
  bookings: readonly ContractBooking[]
): ContractResult {
  const error = validateInput(input, now);
  if (error) {
    return { available: false, reasonCode: error.code, message: error.message };
  }

  if (input.roomBlocked) {
    return {
      available: false,
      reasonCode: 'ROOM_BLOCKED',
      message: 'Unavailable: the room is blocked.',
    };
  }

  const startMin = new Date(input.start).getTime() / 60000;
  const endMin = startMin + input.durationMinutes;
  const conflict = bookings.find((b) => {
    const bStart = BOOKING_DAY_START_MIN + b.start;
    const bEnd = BOOKING_DAY_START_MIN + b.end;
    return startMin < bEnd && bStart < endMin;
  });
  if (conflict) {
    return {
      available: false,
      reasonCode: 'OVERLAP',
      message: `Unavailable: overlaps with "${conflict.title}" (${toLabel(conflict.start)}–${toLabel(conflict.end)}).`,
    };
  }

  const startOfDay = minutesFromDayStart(new Date(input.start));
  return {
    available: true,
    reasonCode: 'AVAILABLE',
    message: `Available: Room A-101 is free from ${toLabel(startOfDay)} to ${toLabel(startOfDay + input.durationMinutes)}.`,
  };
}
