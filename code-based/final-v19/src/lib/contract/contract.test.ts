import { describe, it, expect } from 'vitest';
import { checkContract } from './availability';
import { verdictForReason } from './verdict';
import { BOOKINGS, TEST_NOW, ROOM_NAME } from './data';
import type { ContractBooking } from './data';

const NOW = new Date(TEST_NOW);

// All common test starts are on the fictional booking day 2026-12-01.
const day = (time: string) => `2026-12-01T${time}`;

interface Case {
  name: string;
  start: string;
  duration: number;
  blocked?: boolean;
  available: boolean;
  reasonCode: string;
  message?: RegExp;
}

const cases: Case[] = [
  {
    name: 'T1 valid free interval',
    start: day('17:00'),
    duration: 60,
    available: true,
    reasonCode: 'AVAILABLE',
  },
  {
    name: 'T2 overlap with existing booking',
    start: day('12:30'),
    duration: 60,
    available: false,
    reasonCode: 'OVERLAP',
    message: /Study group/,
  },
  {
    name: 'T3 blocked room',
    start: day('17:00'),
    duration: 60,
    blocked: true,
    available: false,
    reasonCode: 'ROOM_BLOCKED',
  },
  {
    name: 'T4 duration = 0',
    start: day('17:00'),
    duration: 0,
    available: false,
    reasonCode: 'DURATION_NOT_POSITIVE',
  },
  {
    name: 'T5 duration = 121',
    start: day('17:00'),
    duration: 121,
    available: false,
    reasonCode: 'DURATION_TOO_LONG',
  },
  {
    name: 'T6 past start time',
    start: '2026-11-20T10:00',
    duration: 60,
    available: false,
    reasonCode: 'START_IN_PAST',
  },
  {
    name: 'T7 adjacent non-overlapping (13:00-15:00 touches B2 and B3)',
    start: day('13:00'),
    duration: 120,
    available: true,
    reasonCode: 'AVAILABLE',
  },
];

describe('Practice #12 contract (common tests T1-T8)', () => {
  for (const c of cases) {
    it(`${c.name} -> ${c.reasonCode}`, () => {
      const result = checkContract(
        { start: c.start, durationMinutes: c.duration, roomBlocked: c.blocked ?? false },
        NOW,
        BOOKINGS
      );
      expect(result.available).toBe(c.available);
      expect(result.reasonCode).toBe(c.reasonCode);
      if (c.message) expect(result.message).toMatch(c.message);
    });
  }

  // T8: bookings unchanged after running T1-T7
  it('T8 bookings unchanged', () => {
    const snapshot: ContractBooking[] = JSON.parse(JSON.stringify(BOOKINGS));
    for (const c of cases) {
      checkContract(
        { start: c.start, durationMinutes: c.duration, roomBlocked: c.blocked ?? false },
        NOW,
        BOOKINGS
      );
    }
    expect(BOOKINGS).toEqual(snapshot);
    expect(BOOKINGS).toHaveLength(3);
  });
});

describe('Practice #12 contract (extra edge tests)', () => {
  it('empty start -> START_REQUIRED', () => {
    const result = checkContract({ start: '', durationMinutes: 60, roomBlocked: false }, NOW, BOOKINGS);
    expect(result.reasonCode).toBe('START_REQUIRED');
    expect(result.available).toBe(false);
  });

  it('malformed start -> START_REQUIRED', () => {
    const result = checkContract({ start: 'not-a-date', durationMinutes: 60, roomBlocked: false }, NOW, BOOKINGS);
    expect(result.reasonCode).toBe('START_REQUIRED');
  });

  it('non-integer duration -> DURATION_NOT_NUMBER', () => {
    const result = checkContract({ start: day('17:00'), durationMinutes: 30.5, roomBlocked: false }, NOW, BOOKINGS);
    expect(result.reasonCode).toBe('DURATION_NOT_NUMBER');
  });

  it('validation errors take precedence over blocked room', () => {
    // Blocked room + invalid duration: the first failing check (duration) decides.
    const result = checkContract({ start: day('17:00'), durationMinutes: 121, roomBlocked: true }, NOW, BOOKINGS);
    expect(result.reasonCode).toBe('DURATION_TOO_LONG');
  });

  it('negative duration -> DURATION_NOT_POSITIVE', () => {
    const result = checkContract({ start: day('17:00'), durationMinutes: -5, roomBlocked: false }, NOW, BOOKINGS);
    expect(result.reasonCode).toBe('DURATION_NOT_POSITIVE');
  });

  it('start exactly equal to now -> START_IN_PAST', () => {
    const result = checkContract({ start: TEST_NOW, durationMinutes: 60, roomBlocked: false }, NOW, BOOKINGS);
    expect(result.reasonCode).toBe('START_IN_PAST');
  });

  it('room name is the fictional one', () => {
    expect(ROOM_NAME).toBe('Room A-101 (fictional)');
  });
});

describe('Practice #12 contract (D1-D3 regression tests)', () => {
  it('D2: a slot on a different date never overlaps (2026-12-05T12:30 + 60 -> AVAILABLE)', () => {
    const result = checkContract({ start: '2026-12-05T12:30', durationMinutes: 60, roomBlocked: false }, NOW, BOOKINGS);
    expect(result.reasonCode).toBe('AVAILABLE');
    expect(result.available).toBe(true);
  });

  it('D2: an interval crossing midnight is free when no booking spans it (2026-12-01T23:30 + 60 -> AVAILABLE)', () => {
    const result = checkContract({ start: '2026-12-01T23:30', durationMinutes: 60, roomBlocked: false }, NOW, BOOKINGS);
    expect(result.reasonCode).toBe('AVAILABLE');
    expect(result.available).toBe(true);
  });

  it('D2: a real overlap on the booking day still counts (2026-12-01T16:00 + 60 -> OVERLAP, Robotics club)', () => {
    const result = checkContract({ start: '2026-12-01T16:00', durationMinutes: 60, roomBlocked: false }, NOW, BOOKINGS);
    expect(result.reasonCode).toBe('OVERLAP');
    expect(result.available).toBe(false);
    expect(result.message).toMatch(/Robotics club/);
  });

  it('D1: verdict mapping for all 8 reason codes', () => {
    expect(verdictForReason('AVAILABLE')).toBe('Available');
    expect(verdictForReason('ROOM_BLOCKED')).toBe('Unavailable');
    expect(verdictForReason('OVERLAP')).toBe('Unavailable');
    expect(verdictForReason('START_REQUIRED')).toBe('Invalid input');
    expect(verdictForReason('START_IN_PAST')).toBe('Invalid input');
    expect(verdictForReason('DURATION_NOT_NUMBER')).toBe('Invalid input');
    expect(verdictForReason('DURATION_NOT_POSITIVE')).toBe('Invalid input');
    expect(verdictForReason('DURATION_TOO_LONG')).toBe('Invalid input');
  });
});
