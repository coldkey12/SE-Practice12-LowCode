export interface ContractBooking {
  id: string;
  title: string;
  start: number; // minutes after midnight on 2026-12-01
  end: number; // minutes after midnight on 2026-12-01
}

export const ROOM_NAME = 'Room A-101 (fictional)';

export const BOOKINGS: readonly ContractBooking[] = Object.freeze([
  { id: 'B1', title: 'Algorithms lecture', start: 9 * 60, end: 10 * 60 + 30 },
  { id: 'B2', title: 'Study group', start: 12 * 60, end: 13 * 60 },
  { id: 'B3', title: 'Robotics club', start: 15 * 60, end: 16 * 60 + 30 },
]);

// All fictional bookings live on this day; the UI only offers slots on this day.
export const CONTRACT_DAY = '2026-12-01';

export const TEST_NOW = '2026-11-24T18:00';
