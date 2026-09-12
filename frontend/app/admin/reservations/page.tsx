import { AdminReservationsTable } from "@/components/admin-reservations-table";

export default function AdminReservationsPage() {
  return (
    <main className="px-6 py-8 md:px-12">
      <h1 className="font-display text-2xl mb-6">Reservations</h1>
      <AdminReservationsTable />
    </main>
  );
}
