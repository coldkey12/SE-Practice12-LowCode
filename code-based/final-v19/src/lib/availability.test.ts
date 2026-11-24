import { describe, it, expect } from 'vitest';
import { checkAvailability, labelToMinutes, resolveCurrentMinutes } from './availability';
import { SAMPLE_ROOMS, SAMPLE_BOOKINGS } from './data';
import type { Booking, Room } from './types';

const NOW = 540; // 09:00

// --- Fixture factory: returns a fresh room and fresh bookings every call ---

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room-test',
    name: 'Test Room',
    building: 'Test Building',
    capacity: 30,
    blocked: false,
    ...overrides,
  };
}

function makeDefaultBookings(): Booking[] {
  return [
    { id: 'bk1', roomId: 'room-test', title: 'Existing Booking', start: 600, end: 660 },
  ];
}

function makeTwoBookings(): Booking[] {
  return [
    { id: 'bk1', roomId: 'room-test', title: 'First', start: 600, end: 660 },
    { id: 'bk2', roomId: 'room-test', title: 'Second', start: 720, end: 780 },
  ];
}

function cloneRoom(r: Room): Room {
  return { ...r };
}

function cloneBookings(bs: Booking[]): Booking[] {
  return bs.map((b) => ({ ...b }));
}

// --- Helpers for reason assertions ---

// Rule keywords, not the exact sentences of the page: the ACs fix which rule rejects, not the wording.
const RULE = {
  interval: /interval/i, // AC1: 0 <= start < end <= 1440
  afterNow: /current time/i, // AC1: start is after the supplied current time
  limit: /120/, // AC2: longer than 120 minutes
  blocked: /blocked/i, // AC3: blocked room
  overlap: /overlap/i, // AC4: overlaps an existing booking
  noRoom: /room/i, // no room selected
};

function expectUnavailableWithReason(
  res: { available: boolean; reason?: string },
  rule: RegExp
): void {
  expect(res.available).toBe(false);
  expect(res.reason).toBeDefined();
  expect(res.reason).toMatch(rule);
}

function expectAvailableNoReason(res: { available: boolean; reason?: string }): void {
  expect(res.available).toBe(true);
  expect(res.reason).toBeUndefined();
}

describe('checkAvailability — AC1–AC5 (AC6 is UI/layout, not testable via this function)', () => {
  // T01 | 660–720 (touching after) | true | AC4
  it('T01: touching after existing booking (660–720) should be Available', () => {
    const room = makeRoom();
    const bookings = makeDefaultBookings();
    const roomSnap = cloneRoom(room);
    const bookingsSnap = cloneBookings(bookings);

    const res = checkAvailability(room, 660, 720, NOW, bookings);
    expectAvailableNoReason(res);

    expect(room).toEqual(roomSnap);
    expect(bookings).toEqual(bookingsSnap);
  });

  // T02 | 540–570 (starts now, start == currentMinutes) | false | AC1
  it('T02: start equals now (540–570) should be Unavailable with start-after-current reason', () => {
    const room = makeRoom();
    const bookings = makeDefaultBookings();
    const roomSnap = cloneRoom(room);
    const bookingsSnap = cloneBookings(bookings);

    const res = checkAvailability(room, 540, 570, NOW, bookings);
    expectUnavailableWithReason(res, RULE.afterNow);

    expect(room).toEqual(roomSnap);
    expect(bookings).toEqual(bookingsSnap);
  });

  // T03 | 720–720 (zero duration) | false | AC1
  it('T03: zero duration (720–720) should be Unavailable with interval reason', () => {
    const room = makeRoom();
    const bookings = makeDefaultBookings();
    const roomSnap = cloneRoom(room);
    const bookingsSnap = cloneBookings(bookings);

    const res = checkAvailability(room, 720, 720, NOW, bookings);
    expectUnavailableWithReason(res, RULE.interval);

    expect(room).toEqual(roomSnap);
    expect(bookings).toEqual(bookingsSnap);
  });

  // T04 | 750–720 (reversed) | false | AC1
  it('T04: reversed interval (750–720) should be Unavailable with interval reason', () => {
    const room = makeRoom();
    const bookings = makeDefaultBookings();
    const roomSnap = cloneRoom(room);
    const bookingsSnap = cloneBookings(bookings);

    const res = checkAvailability(room, 750, 720, NOW, bookings);
    expectUnavailableWithReason(res, RULE.interval);

    expect(room).toEqual(roomSnap);
    expect(bookings).toEqual(bookingsSnap);
  });

  // T05 | 1380–1441 (past day end) | false | AC1
  it('T05: end past day end (1380–1441) should be Unavailable with interval reason', () => {
    const room = makeRoom();
    const bookings = makeDefaultBookings();
    const roomSnap = cloneRoom(room);
    const bookingsSnap = cloneBookings(bookings);

    const res = checkAvailability(room, 1380, 1441, NOW, bookings);
    expectUnavailableWithReason(res, RULE.interval);

    expect(room).toEqual(roomSnap);
    expect(bookings).toEqual(bookingsSnap);
  });

  // T06 | 720–840 (120 minutes, exactly the limit) | true | AC2
  it('T06: exactly 120 minutes (720–840) should be Available', () => {
    const room = makeRoom();
    const bookings = makeDefaultBookings();
    const roomSnap = cloneRoom(room);
    const bookingsSnap = cloneBookings(bookings);

    const res = checkAvailability(room, 720, 840, NOW, bookings);
    expectAvailableNoReason(res);

    expect(room).toEqual(roomSnap);
    expect(bookings).toEqual(bookingsSnap);
  });

  // T07 | 720–841 (121 minutes, over the limit) | false | AC2
  it('T07: 121 minutes (720–841) should be Unavailable with 120-minute reason', () => {
    const room = makeRoom();
    const bookings = makeDefaultBookings();
    const roomSnap = cloneRoom(room);
    const bookingsSnap = cloneBookings(bookings);

    const res = checkAvailability(room, 720, 841, NOW, bookings);
    expectUnavailableWithReason(res, RULE.limit);

    expect(room).toEqual(roomSnap);
    expect(bookings).toEqual(bookingsSnap);
  });

  // T08 | 570–600 (touching before) | true | AC4
  it('T08: touching before existing booking (570–600) should be Available', () => {
    const room = makeRoom();
    const bookings = makeDefaultBookings();
    const roomSnap = cloneRoom(room);
    const bookingsSnap = cloneBookings(bookings);

    const res = checkAvailability(room, 570, 600, NOW, bookings);
    expectAvailableNoReason(res);

    expect(room).toEqual(roomSnap);
    expect(bookings).toEqual(bookingsSnap);
  });

  // T09 | 630–690 (partial overlap) | false | AC4
  it('T09: partial overlap (630–690) should be Unavailable with overlap reason', () => {
    const room = makeRoom();
    const bookings = makeDefaultBookings();
    const roomSnap = cloneRoom(room);
    const bookingsSnap = cloneBookings(bookings);

    const res = checkAvailability(room, 630, 690, NOW, bookings);
    expectUnavailableWithReason(res, RULE.overlap);

    expect(room).toEqual(roomSnap);
    expect(bookings).toEqual(bookingsSnap);
  });

  // T10 | 570–690 (contains booking, exactly 120 min) | false | AC4
  it('T10: contains existing booking (570–690) should be Unavailable with overlap reason', () => {
    const room = makeRoom();
    const bookings = makeDefaultBookings();
    const roomSnap = cloneRoom(room);
    const bookingsSnap = cloneBookings(bookings);

    const res = checkAvailability(room, 570, 690, NOW, bookings);
    expectUnavailableWithReason(res, RULE.overlap);

    expect(room).toEqual(roomSnap);
    expect(bookings).toEqual(bookingsSnap);
  });

  // T11 | 615–645 (inside booking) | false | AC4
  it('T11: inside existing booking (615–645) should be Unavailable with overlap reason', () => {
    const room = makeRoom();
    const bookings = makeDefaultBookings();
    const roomSnap = cloneRoom(room);
    const bookingsSnap = cloneBookings(bookings);

    const res = checkAvailability(room, 615, 645, NOW, bookings);
    expectUnavailableWithReason(res, RULE.overlap);

    expect(room).toEqual(roomSnap);
    expect(bookings).toEqual(bookingsSnap);
  });

  // T12 | 600–660 (identical interval) | false | AC4
  it('T12: identical interval (600–660) should be Unavailable with overlap reason', () => {
    const room = makeRoom();
    const bookings = makeDefaultBookings();
    const roomSnap = cloneRoom(room);
    const bookingsSnap = cloneBookings(bookings);

    const res = checkAvailability(room, 600, 660, NOW, bookings);
    expectUnavailableWithReason(res, RULE.overlap);

    expect(room).toEqual(roomSnap);
    expect(bookings).toEqual(bookingsSnap);
  });

  // T13 | 660–720, blocked = true | false | AC3
  it('T13: blocked room (660–720) should be Unavailable with blocked reason', () => {
    const room = makeRoom({ blocked: true });
    const bookings = makeDefaultBookings();
    const roomSnap = cloneRoom(room);
    const bookingsSnap = cloneBookings(bookings);

    const res = checkAvailability(room, 660, 720, NOW, bookings);
    expectUnavailableWithReason(res, RULE.blocked);

    expect(room).toEqual(roomSnap);
    expect(bookings).toEqual(bookingsSnap);
  });

  // T14 | 630–690, bookings = [] | true | AC4
  it('T14: no bookings (630–690) should be Available', () => {
    const room = makeRoom();
    const bookings: Booking[] = [];
    const roomSnap = cloneRoom(room);
    const bookingsSnap = cloneBookings(bookings);

    const res = checkAvailability(room, 630, 690, NOW, bookings);
    expectAvailableNoReason(res);

    expect(room).toEqual(roomSnap);
    expect(bookings).toEqual(bookingsSnap);
  });

  // T15 | AC5 data preservation: the same data is checked repeatedly (Available and Unavailable results)
  it('T15: bookings and room are unchanged after repeated Available and Unavailable checks on the same data (AC5)', () => {
    const room = makeRoom();
    const bookings = makeTwoBookings();
    const roomBefore = JSON.stringify(room);
    const bookingsBefore = JSON.stringify(bookings);

    const decisions = [
      checkAvailability(room, 660, 720, NOW, bookings).available, // fits the gap, touches both bookings
      checkAvailability(room, 630, 690, NOW, bookings).available, // overlaps the first booking
      checkAvailability(room, 540, 570, NOW, bookings).available, // starts now
      checkAvailability(room, 900, 1021, NOW, bookings).available, // 121 minutes
      checkAvailability(room, 660, 720, NOW, bookings).available, // the first request again
    ];

    expect(decisions).toEqual([true, false, false, false, true]);
    expect(JSON.stringify(room)).toBe(roomBefore);
    expect(JSON.stringify(bookings)).toBe(bookingsBefore);
    expect(bookings).toHaveLength(2);
  });

  // T16 | 1380–1440 (ends exactly at day end) | true | AC1
  it('T16: ends exactly at day end (1380–1440) should be Available', () => {
    const room = makeRoom();
    const bookings = makeDefaultBookings();
    const roomSnap = cloneRoom(room);
    const bookingsSnap = cloneBookings(bookings);

    const res = checkAvailability(room, 1380, 1440, NOW, bookings);
    expectAvailableNoReason(res);

    expect(room).toEqual(roomSnap);
    expect(bookings).toEqual(bookingsSnap);
  });

  // T17 | 690–750 with bookings [600–660, 720–780] (overlaps only the second) | false | AC4
  it('T17: overlaps only second booking (690–750) should be Unavailable with overlap reason', () => {
    const room = makeRoom();
    const bookings = makeTwoBookings();
    const roomSnap = cloneRoom(room);
    const bookingsSnap = cloneBookings(bookings);

    const res = checkAvailability(room, 690, 750, NOW, bookings);
    expectUnavailableWithReason(res, RULE.overlap);

    expect(room).toEqual(roomSnap);
    expect(bookings).toEqual(bookingsSnap);
  });

  // T18 | 541–571 (starts one minute after now) | true | AC1
  it('T18: starts one minute after now (541–571) should be Available', () => {
    const room = makeRoom();
    const bookings = makeDefaultBookings();
    const roomSnap = cloneRoom(room);
    const bookingsSnap = cloneBookings(bookings);

    const res = checkAvailability(room, 541, 571, NOW, bookings);
    expectAvailableNoReason(res);

    expect(room).toEqual(roomSnap);
    expect(bookings).toEqual(bookingsSnap);
  });

  // T19 | 630–690 when the 600–660 booking belongs to a different room | true | AC4
  it('T19: overlap belongs to a different room (630–690) should be Available', () => {
    const room = makeRoom();
    const bookings: Booking[] = [
      { id: 'bk1', roomId: 'room-other', title: 'Other Room Booking', start: 600, end: 660 },
    ];
    const roomSnap = cloneRoom(room);
    const bookingsSnap = cloneBookings(bookings);

    const res = checkAvailability(room, 630, 690, NOW, bookings);
    expectAvailableNoReason(res);

    expect(room).toEqual(roomSnap);
    expect(bookings).toEqual(bookingsSnap);
  });

  // T20 | 660–720 with room = null (no room selected) | false, with a reason | AC6 feedback
  it('T20: null room (660–720) should be Unavailable with a room-selection reason', () => {
    const bookings = makeDefaultBookings();
    const bookingsSnap = cloneBookings(bookings);

    const res = checkAvailability(null, 660, 720, NOW, bookings);
    expectUnavailableWithReason(res, RULE.noRoom);

    expect(bookings).toEqual(bookingsSnap);
  });

  // T21 | real sample data: Newton Lab 220 (r2), now 540, 660–720 | true, SAMPLE_BOOKINGS deep-equal snapshot | AC4/AC5
  it('T21: real sample data Newton Lab 220 (660–720) should be Available with SAMPLE_BOOKINGS unchanged', () => {
    const room = SAMPLE_ROOMS.find((r) => r.id === 'r2')!;
    const bookings = SAMPLE_BOOKINGS;
    const bookingsSnap = cloneBookings(bookings);
    const roomSnap = cloneRoom(room);

    const res = checkAvailability(room, 660, 720, NOW, bookings);
    expectAvailableNoReason(res);

    expect(bookings).toEqual(bookingsSnap);
    expect(room).toEqual(roomSnap);
  });

  // T22 | real sample data: Curie Auditorium (r3, blocked), now 540, 660–720 | false with blocked reason, data unchanged | AC3/AC5
  it('T22: real sample data Curie Auditorium blocked (660–720) should be Unavailable with blocked reason and data unchanged', () => {
    const room = SAMPLE_ROOMS.find((r) => r.id === 'r3')!;
    const bookings = SAMPLE_BOOKINGS;
    const bookingsSnap = cloneBookings(bookings);
    const roomSnap = cloneRoom(room);
    const roomsSnap = SAMPLE_ROOMS.map(cloneRoom);

    const res = checkAvailability(room, 660, 720, NOW, bookings);
    expectUnavailableWithReason(res, RULE.blocked);

    expect(bookings).toEqual(bookingsSnap);
    expect(room).toEqual(roomSnap);
    expect(SAMPLE_ROOMS).toEqual(roomsSnap);
  });
  // T23 | BUG-A regression: touching both bookings, touching before, touching after; 1-minute overlaps on each side | AC4/AC5
  it('T23 (BUG-A regression): endpoint touches are Available, one-minute overlaps are Unavailable, data unchanged', () => {
    const room = makeRoom();
    const bookings = makeTwoBookings(); // 600–660 and 720–780
    const roomSnap = cloneRoom(room);
    const bookingsSnap = cloneBookings(bookings);

    expectAvailableNoReason(checkAvailability(room, 660, 720, NOW, bookings)); // fills the gap, touches both
    expectAvailableNoReason(checkAvailability(room, 570, 600, NOW, bookings)); // ends where the first starts
    expectAvailableNoReason(checkAvailability(room, 780, 840, NOW, bookings)); // starts where the second ends
    expectUnavailableWithReason(checkAvailability(room, 659, 719, NOW, bookings), RULE.overlap); // 1 min into the first
    expectUnavailableWithReason(checkAvailability(room, 661, 721, NOW, bookings), RULE.overlap); // 1 min into the second

    expect(room).toEqual(roomSnap);
    expect(bookings).toEqual(bookingsSnap);
  });
  // T24 | BUG-B regression: smallest input = two bookings stored out of time order | AC5
  it('T24 (BUG-B regression): checking availability does not reorder or change the bookings array', () => {
    const room = makeRoom();
    const bookings: Booking[] = [
      { id: 'bk2', roomId: 'room-test', title: 'Second', start: 720, end: 780 },
      { id: 'bk1', roomId: 'room-test', title: 'First', start: 600, end: 660 },
    ];
    const bookingsSnap = cloneBookings(bookings);

    expectAvailableNoReason(checkAvailability(room, 660, 720, NOW, bookings));
    expectUnavailableWithReason(checkAvailability(room, 630, 690, NOW, bookings), RULE.overlap);

    expect(bookings.map((b) => b.id)).toEqual(['bk2', 'bk1']);
    expect(bookings).toEqual(bookingsSnap);
  });
  // ---- Practice #10 risk regression tests (written before the fixes) ----

  // T25 | R5: labelToMinutes must reject out-of-range labels instead of silently converting them | AC1
  it('T25 (R5 regression): malformed time labels become NaN and the request is Unavailable', () => {
    expect(labelToMinutes('00:00')).toBe(0);
    expect(labelToMinutes('23:59')).toBe(1439);
    expect(labelToMinutes('24:00')).toBe(1440);
    for (const bad of ['10:75', '24:01', '99:99', 'ab:cd', '7:5', '']) {
      expect(Number.isNaN(labelToMinutes(bad))).toBe(true);
    }
    const room = makeRoom();
    const bookings = makeDefaultBookings();
    const bookingsSnap = cloneBookings(bookings);
    // '10:75' used to become 675 (11:15) and was reported Available
    expectUnavailableWithReason(
      checkAvailability(room, labelToMinutes('10:75'), labelToMinutes('11:30'), NOW, bookings),
      RULE.interval
    );
    expect(bookings).toEqual(bookingsSnap);
  });

  // T26 | R1/R2: the past-time rule must use the real clock; an edited or stale "current time" cannot move it back | AC1
  it('T26 (R1 regression): the effective current time is never earlier than the live clock', () => {
    const live = 18 * 60 + 36; // 18:36 real clock
    expect(resolveCurrentMinutes(0, live)).toBe(live); // user typed 00:00 -> ignored
    expect(resolveCurrentMinutes(live - 3, live)).toBe(live); // stale value from page load -> live clock wins
    expect(resolveCurrentMinutes(20 * 60, live)).toBe(20 * 60); // a later time may still be simulated
    const room = makeRoom();
    // 08:00-08:30 is in the past at 18:36 even if the field says 00:00
    expectUnavailableWithReason(
      checkAvailability(room, 480, 510, resolveCurrentMinutes(0, live), []),
      RULE.afterNow
    );
  });
});
