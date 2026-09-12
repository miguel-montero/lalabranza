export type ReservationPayload = {
  date: string;
  timeSlot: string;
  partySize: number;
  name: string;
  email: string;
  phone: string;
  notes?: string;
};

export async function checkAvailability(
  date: string,
  timeSlot: string,
): Promise<{ remaining: number }> {
  const res = await fetch(
    `/webdb/availability.php?date=${encodeURIComponent(date)}&time_slot=${encodeURIComponent(timeSlot)}`,
  );
  return res.json();
}

export async function createReservation(
  payload: ReservationPayload,
): Promise<{ status: string; id: number } | { error: string }> {
  const res = await fetch("/webdb/reservations_create.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: payload.date,
      time_slot: payload.timeSlot,
      party_size: payload.partySize,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      notes: payload.notes,
    }),
  });
  return res.json();
}
