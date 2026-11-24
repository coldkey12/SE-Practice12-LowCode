import type { Room } from '@/lib/types';
import { Lock, Users, MapPin } from 'lucide-react';

interface Props {
  rooms: Room[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function RoomSelector({ rooms, selectedId, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {rooms.map((room) => {
        const active = room.id === selectedId;
        return (
          <button
            key={room.id}
            type="button"
            onClick={() => onSelect(room.id)}
            className={`text-left rounded-xl border p-4 transition-all duration-200 ${
              active
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{room.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" /> {room.building}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                  <Users className="h-3 w-3" /> {room.capacity} seats
                </p>
              </div>
              {room.blocked && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                  <Lock className="h-3 w-3" /> Blocked
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
