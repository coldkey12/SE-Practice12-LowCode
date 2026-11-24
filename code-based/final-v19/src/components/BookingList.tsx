import type { Room, Booking } from '@/lib/types';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { minutesToLabel } from '@/lib/availability';

interface Props {
  room: Room;
  bookings: Booking[];
}

export default function BookingList({ room, bookings }: Props) {
  const roomBookings = bookings
    .filter((b) => b.roomId === room.id)
    .sort((a, b) => a.start - b.start);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-900">
          Existing bookings — {room.name}
        </h3>
      </div>
      {roomBookings.length === 0 ? (
        <p className="text-sm text-gray-400">No bookings for this room.</p>
      ) : (
        <ul className="space-y-2">
          {roomBookings.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
            >
              <span className="font-medium text-gray-800">{b.title}</span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                {minutesToLabel(b.start)} – {minutesToLabel(b.end)}
              </span>
            </li>
          ))}
        </ul>
      )}
      {room.blocked && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          <XCircle className="h-4 w-4" />
          This room is blocked — no bookings allowed.
        </div>
      )}
    </div>
  );
}
