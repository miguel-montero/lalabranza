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
  if (!res.ok) {
    // Treat any non-200 response (bad request, server error, etc.) as "no
    // confirmed capacity" rather than trusting/parsing an error body as if
    // it had the `{ remaining }` shape.
    return { remaining: 0 };
  }
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

export async function adminLogin(
  username: string,
  password: string,
): Promise<{ status: string } | { error: string }> {
  const res = await fetch("/webdb/admin_login.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export type AdminReservation = {
  id: number;
  name: string;
  email: string;
  phone: string;
  party_size: number;
  reservation_date: string;
  time_slot: string;
  status: "pending" | "confirmed" | "cancelled";
  notes: string | null;
};

export async function fetchAdminReservations(): Promise<
  { reservations: AdminReservation[] } | { error: string }
> {
  const res = await fetch("/webdb/admin_reservations_list.php");
  if (res.status === 401) {
    return { error: "unauthorized" };
  }
  return res.json();
}

export async function adminLogout(): Promise<{ status: string }> {
  const res = await fetch("/webdb/admin_logout.php", {
    method: "POST",
  });
  return res.json();
}

export async function updateReservationStatus(
  id: number,
  status: "confirmed" | "cancelled",
): Promise<{ status: string } | { error: string }> {
  const res = await fetch("/webdb/admin_reservations_update.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
  return res.json();
}
