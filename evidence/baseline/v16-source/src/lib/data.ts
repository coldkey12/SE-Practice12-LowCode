import type { Room, Booking } from './types';

export const SAMPLE_ROOMS: Room[] = [
  { id: 'r1', name: 'Athena Hall 101', building: 'North Wing', capacity: 30, blocked: false },
  { id: 'r2', name: 'Newton Lab 220', building: 'East Wing', capacity: 20, blocked: false },
  { id: 'r3', name: 'Curie Auditorium', building: 'Main Block', capacity: 120, blocked: true },
  { id: 'r4', name: 'Turing Lab 305', building: 'South Wing', capacity: 16, blocked: false },
  { id: 'r5', name: 'Da Vinci Studio', building: 'Arts Center', capacity: 25, blocked: false },
];

export const SAMPLE_BOOKINGS: Booking[] = [
  { id: 'b1', roomId: 'r1', title: 'Intro to Algorithms', start: 9 * 60 + 0, end: 9 * 60 + 50 },
  { id: 'b2', roomId: 'r1', title: 'Calculus II', start: 11 * 60 + 0, end: 11 * 60 + 50 },
  { id: 'b3', roomId: 'r2', title: 'Physics Lab', start: 10 * 60 + 15, end: 11 * 60 + 0 },
  { id: 'b4', roomId: 'r4', title: 'Robotics Workshop', start: 14 * 60 + 0, end: 14 * 60 + 90 },
  { id: 'b5', roomId: 'r5', title: 'Painting Studio', start: 13 * 60 + 30, end: 14 * 60 + 30 },
  { id: 'b6', roomId: 'r1', title: 'Study Group', start: 15 * 60 + 0, end: 15 * 60 + 45 },
];
