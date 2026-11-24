import type { ReasonCode } from './validation';

export type Verdict = 'Available' | 'Unavailable' | 'Invalid input';

export function verdictForReason(code: ReasonCode): Verdict {
  switch (code) {
    case 'AVAILABLE':
      return 'Available';
    case 'ROOM_BLOCKED':
    case 'OVERLAP':
      return 'Unavailable';
    default:
      return 'Invalid input';
  }
}
