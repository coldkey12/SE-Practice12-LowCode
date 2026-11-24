export interface ContractInput {
  start: string; // local date-time YYYY-MM-DDTHH:MM
  durationMinutes: number;
  roomBlocked: boolean;
}

export type ReasonCode =
  | 'START_REQUIRED'
  | 'START_IN_PAST'
  | 'DURATION_NOT_NUMBER'
  | 'DURATION_NOT_POSITIVE'
  | 'DURATION_TOO_LONG'
  | 'ROOM_BLOCKED'
  | 'OVERLAP'
  | 'AVAILABLE';

export interface ValidationError {
  code: ReasonCode;
  message: string;
}

export const MESSAGES: Record<ReasonCode, string> = {
  START_REQUIRED: 'Please choose a start date and time.',
  START_IN_PAST: 'Start time must be in the future.',
  DURATION_NOT_NUMBER: 'Duration must be a whole number of minutes.',
  DURATION_NOT_POSITIVE: 'Duration must be greater than 0 minutes.',
  DURATION_TOO_LONG: 'Duration must be at most 120 minutes.',
  ROOM_BLOCKED: 'Unavailable: the room is blocked.',
  OVERLAP: 'Unavailable: overlaps with "<title>" (<HH:MM>–<HH:MM>).',
  AVAILABLE: 'Available: Room A-101 is free from <HH:MM> to <HH:MM>.',
};

const LOCAL_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export function parseStart(start: string): Date | null {
  if (!LOCAL_DATETIME.test(start)) return null;
  const date = new Date(start);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Pure: returns the first validation error (codes 1-5 in contract order) or null.
export function validateInput(
  input: ContractInput,
  now: Date
): ValidationError | null {
  const startDate = parseStart(input.start);
  if (!startDate) {
    return { code: 'START_REQUIRED', message: MESSAGES.START_REQUIRED };
  }
  if (startDate.getTime() <= now.getTime()) {
    return { code: 'START_IN_PAST', message: MESSAGES.START_IN_PAST };
  }
  if (!Number.isInteger(input.durationMinutes)) {
    return { code: 'DURATION_NOT_NUMBER', message: MESSAGES.DURATION_NOT_NUMBER };
  }
  if (input.durationMinutes <= 0) {
    return { code: 'DURATION_NOT_POSITIVE', message: MESSAGES.DURATION_NOT_POSITIVE };
  }
  if (input.durationMinutes > 120) {
    return { code: 'DURATION_TOO_LONG', message: MESSAGES.DURATION_TOO_LONG };
  }
  return null;
}
