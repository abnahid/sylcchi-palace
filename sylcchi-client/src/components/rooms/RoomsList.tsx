"use client";

import { useRooms } from "@/hooks/useRooms";

export default function RoomsList() {
  const { data: rooms, isPending, isError, error } = useRooms();

  if (isPending) {
    return <p>Loading rooms...</p>;
  }

  if (isError) {
    return <p>Failed to load rooms: {error.message}</p>;
  }

  if (!rooms.length) {
    return <p>No rooms available right now.</p>;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">Available Rooms</h2>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <li key={room.id} className="rounded-lg border p-4">
            <h3 className="text-lg font-medium">{room.name}</h3>
            <p className="text-sm text-muted-foreground">
              Capacity: {room.capacity}
            </p>
            <p className="mt-1 text-sm">${room.pricePerNight} / night</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
