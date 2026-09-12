"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminLogout,
  fetchAdminReservations,
  updateReservationStatus,
  type AdminReservation,
} from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

const STATUS_VARIANT: Record<AdminReservation["status"], string> = {
  pending: "bg-[var(--color-lana-dorada)] text-[var(--color-piedra-volcanica)]",
  confirmed: "bg-[var(--color-vina)]",
  cancelled: "bg-[var(--color-piedra-volcanica)] text-[var(--color-fibra-cruda)]",
};

export function AdminReservationsTable() {
  const router = useRouter();
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminReservations().then((result) => {
      if ("error" in result) {
        router.push("/admin/login");
        return;
      }
      setReservations(result.reservations);
      setLoading(false);
    });
    // Fetch once on mount only. `router` (from `next/navigation`, or a test
    // double for it) is not guaranteed to be referentially stable across
    // renders, and including it here would re-trigger the fetch on every
    // state update — clobbering local edits made via handleUpdate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    // Always redirect to login, even if the logout request itself fails
    // (network error, non-JSON response) — getting the admin back to a
    // known screen is more important than the request succeeding
    // cleanly, and a stale session will still expire on its own.
    try {
      await adminLogout();
    } catch {
      // Swallow — the redirect below still happens either way.
    }
    router.push("/admin/login");
  };

  const handleUpdate = async (id: number, status: "confirmed" | "cancelled") => {
    const result = await updateReservationStatus(id, status);
    if (!("error" in result)) {
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
    }
  };

  if (loading) {
    return <p>Loading…</p>;
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" variant="outline" onClick={handleLogout}>
          Log out
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.reservation_date}</TableCell>
              <TableCell>{r.time_slot.slice(0, 5)}</TableCell>
              <TableCell>{r.party_size}</TableCell>
              <TableCell>
                <Badge className={STATUS_VARIANT[r.status]}>{r.status}</Badge>
              </TableCell>
              <TableCell>
                {r.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => handleUpdate(r.id, "confirmed")}>
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdate(r.id, "cancelled")}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
