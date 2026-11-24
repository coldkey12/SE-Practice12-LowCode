import { useMemo, useState } from 'react';
import { Building2, Clock, Search, CalendarClock } from 'lucide-react';
import type { Booking, CheckResult } from '@/lib/types';
import { SAMPLE_ROOMS, SAMPLE_BOOKINGS } from '@/lib/data';
import {
  checkAvailability,
  labelToMinutes,
  minutesToLabel,
  resolveCurrentMinutes,
  DAY_END,
  MAX_BOOKING_MINUTES,
} from '@/lib/availability';
import RoomSelector from '@/components/RoomSelector';
import BookingList from '@/components/BookingList';

function getCurrentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export default function App() {
  const [bookings] = useState<Booking[]>(SAMPLE_BOOKINGS);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:00');
  const [currentTimeStr, setCurrentTimeStr] = useState(minutesToLabel(getCurrentMinutes()));
  const [result, setResult] = useState<CheckResult | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selectedRoom = useMemo(
    () => SAMPLE_ROOMS.find((r) => r.id === selectedRoomId) ?? null,
    [selectedRoomId]
  );

  const duration = labelToMinutes(endTime) - labelToMinutes(startTime);

  const isValidTime = (s: string): boolean => /^\d{2}:\d{2}$/.test(s) && !Number.isNaN(labelToMinutes(s));

  const handleCheck = () => {
    if (!isValidTime(currentTimeStr)) {
      setResult({ available: false, reason: 'Please enter a current time.' });
      setSubmitted(true);
      return;
    }
    if (!isValidTime(startTime)) {
      setResult({ available: false, reason: 'Please enter a start time.' });
      setSubmitted(true);
      return;
    }
    if (!isValidTime(endTime)) {
      setResult({ available: false, reason: 'Please enter an end time.' });
      setSubmitted(true);
      return;
    }

    const start = labelToMinutes(startTime);
    const end = labelToMinutes(endTime);
    const currentMinutes = resolveCurrentMinutes(labelToMinutes(currentTimeStr), getCurrentMinutes());
    const res = checkAvailability(selectedRoom, start, end, currentMinutes, bookings);
    setResult(res);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Smart Campus Room Availability
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Check whether a campus room is free for your desired time slot.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
            <Clock className="h-3.5 w-3.5 text-blue-500" />
            Current time (editable): {currentTimeStr}
          </div>
        </header>

        {/* Step 1: Room selection */}
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            1. Select a room
          </h2>
          <RoomSelector
            rooms={SAMPLE_ROOMS}
            selectedId={selectedRoomId}
            onSelect={(id) => {
              setSelectedRoomId(id);
              setSubmitted(false);
            }}
          />
        </section>

        {/* Step 2: Time interval + check */}
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            2. Pick a time interval
          </h2>
          <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <div className="mb-4">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-600">Current time (supply for the check)</span>
                <input
                  type="time"
                  value={currentTimeStr}
                  onChange={(e) => {
                    setCurrentTimeStr(e.target.value);
                    setSubmitted(false);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-auto"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-600">Start time</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    setSubmitted(false);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-600">End time</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    setSubmitted(false);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                <CalendarClock className="h-3.5 w-3.5" />
                Duration: {duration > 0 ? `${duration} min` : '—'}
              </span>
              <span className="text-xs text-gray-400">
                Max {MAX_BOOKING_MINUTES} min · Day ends {minutesToLabel(DAY_END)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCheck}
              disabled={!selectedRoomId}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
            >
              <Search className="h-4 w-4" />
              Check availability
            </button>
          </div>
        </section>

        {/* Result */}
        {submitted && result && (
          <section className="mb-6">
            <div
              className={`rounded-xl border p-4 transition-all duration-300 ${
                result.available
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    result.available ? 'bg-green-500' : 'bg-red-500'
                  } text-white`}
                >
                  {result.available ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div>
                  <p
                    className={`text-base font-bold ${
                      result.available ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {result.available ? 'Available' : 'Unavailable'}
                  </p>
                  {result.reason && (
                    <p className={`mt-0.5 text-sm ${result.available ? 'text-green-700' : 'text-red-700'}`}>
                      {result.reason}
                    </p>
                  )}
                  {result.available && selectedRoom && (
                    <p className="mt-1 text-sm text-green-700">
                      {selectedRoom.name} is free from {startTime} to {endTime}.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Existing bookings for selected room */}
        {selectedRoom && (
          <section className="mb-6">
            <BookingList room={selectedRoom} bookings={bookings} />
          </section>
        )}

        <footer className="mt-10 text-center text-xs text-gray-400">
          Fictional sample data · No real bookings are created or modified.
        </footer>
      </div>
    </div>
  );
}
