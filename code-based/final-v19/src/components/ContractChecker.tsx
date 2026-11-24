import { useState } from 'react';
import { CalendarClock, Building2, CircleCheck, CircleX, AlertCircle, Lock } from 'lucide-react';
import { checkContract } from '@/lib/contract/availability';
import { BOOKINGS, CONTRACT_DAY, ROOM_NAME } from '@/lib/contract/data';
import { verdictForReason } from '@/lib/contract/verdict';
import type { ReasonCode } from '@/lib/contract/validation';

const REASON_TONE: Record<ReasonCode, 'ok' | 'error' | 'warn'> = {
  AVAILABLE: 'ok',
  OVERLAP: 'error',
  ROOM_BLOCKED: 'warn',
  START_REQUIRED: 'error',
  START_IN_PAST: 'error',
  DURATION_NOT_NUMBER: 'error',
  DURATION_NOT_POSITIVE: 'error',
  DURATION_TOO_LONG: 'error',
};

const TONE_STYLES = {
  ok: { border: 'border-green-200 bg-green-50', icon: 'bg-green-500', text: 'text-green-800', sub: 'text-green-700', label: 'Available' },
  error: { border: 'border-red-200 bg-red-50', icon: 'bg-red-500', text: 'text-red-800', sub: 'text-red-700', label: 'Invalid input' },
  warn: { border: 'border-amber-200 bg-amber-50', icon: 'bg-amber-500', text: 'text-amber-800', sub: 'text-amber-700', label: 'Unavailable' },
} as const;

export default function ContractChecker() {
  const [start, setStart] = useState('');
  const [duration, setDuration] = useState('60');
  const [blocked, setBlocked] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof checkContract> | null>(null);

  const handleCheck = () => {
    const now = new Date();
    const durationNum = duration.trim() === '' ? NaN : Number(duration);
    const res = checkContract(
      { start, durationMinutes: durationNum, roomBlocked: blocked },
      now,
      BOOKINGS
    );
    setResult(res);
  };

  const tone = result ? TONE_STYLES[REASON_TONE[result.reasonCode]] : null;
  const verdict = result ? verdictForReason(result.reasonCode) : null;

  const requestedLabel = (() => {
    if (!start) return null;
    const startDate = new Date(start);
    if (Number.isNaN(startDate.getTime())) return null;
    const pad = (n: number) => String(n).padStart(2, '0');
    const date = `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-${pad(startDate.getDate())}`;
    const from = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
    const end = new Date(startDate.getTime() + (Number.isNaN(Number(duration)) ? 0 : Number(duration)) * 60000);
    const to = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
    return `${date} ${from}–${to}`;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{ROOM_NAME}</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Check whether the room is free for your desired time slot.
          </p>
        </header>

        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Check availability
          </h2>
          <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <label className="mb-4 block">
              <span className="mb-1 block text-xs font-medium text-gray-600">Start time</span>
              <input
                type="datetime-local"
                value={start}
                min={CONTRACT_DAY + 'T00:00'}
                onChange={(e) => {
                  setStart(e.target.value);
                  setResult(null);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>

            <label className="mb-4 block">
              <span className="mb-1 block text-xs font-medium text-gray-600">Duration (minutes, 1–120)</span>
              <input
                type="number"
                min={1}
                max={120}
                step={1}
                value={duration}
                onChange={(e) => {
                  setDuration(e.target.value);
                  setResult(null);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-40"
              />
            </label>

            <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                <Lock className="h-4 w-4 text-gray-400" />
                Room blocked
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={blocked}
                onClick={() => {
                  setBlocked(!blocked);
                  setResult(null);
                }}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  blocked ? 'bg-amber-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    blocked ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={handleCheck}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto"
            >
              <CalendarClock className="h-4 w-4" />
              Check availability
            </button>
          </div>
        </section>

        {result && tone && verdict && (
          <section className="mb-6" aria-live="polite">
            <div className={`rounded-xl border p-4 transition-all duration-300 ${tone.border}`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone.icon} text-white`}>
                  {result.reasonCode === 'AVAILABLE' ? (
                    <CircleCheck className="h-5 w-5" />
                  ) : REASON_TONE[result.reasonCode] === 'error' ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <CircleX className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={`text-base font-bold ${tone.text}`}>{verdict}</p>
                    <code className="rounded bg-white/70 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                      {result.reasonCode}
                    </code>
                  </div>
                  <p className={`mt-0.5 break-words text-sm ${tone.sub}`}>{result.message}</p>
                  {result.reasonCode === 'AVAILABLE' && requestedLabel && (
                    <p className="mt-1 text-sm text-green-700">
                      Requested: {requestedLabel}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Existing bookings
          </h2>
          <ul className="space-y-2">
            {BOOKINGS.map((b) => (
              <li
                key={b.id}
                className="flex flex-col gap-0.5 rounded-lg border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-medium text-gray-900">{b.title}</span>
                <span className="text-xs text-gray-500">
                  {CONTRACT_DAY} · {String(Math.floor(b.start / 60)).padStart(2, '0')}:
                  {String(b.start % 60).padStart(2, '0')}–
                  {String(Math.floor(b.end / 60)).padStart(2, '0')}:
                  {String(b.end % 60).padStart(2, '0')}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-10 text-center text-xs text-gray-400">
          Fictional sample data · No real bookings are created or modified.
        </footer>
      </div>
    </div>
  );
}
