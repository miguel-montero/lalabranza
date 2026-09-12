import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminReservationsTable } from "./admin-reservations-table";
import * as api from "@/lib/api";

vi.mock("@/lib/api");
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));

const sampleReservation: api.AdminReservation = {
  id: 1,
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+15551234567",
  party_size: 2,
  reservation_date: "2026-09-17",
  time_slot: "13:00:00",
  status: "pending",
  notes: null,
};

describe("AdminReservationsTable", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders each reservation with a status badge", async () => {
    vi.mocked(api.fetchAdminReservations).mockResolvedValue({
      reservations: [sampleReservation],
    });

    render(<AdminReservationsTable />);

    await waitFor(() => expect(screen.getByText("Jane Doe")).toBeInTheDocument());
    expect(screen.getByText("pending")).toBeInTheDocument();
  });

  it("redirects to /admin/login when the fetch is unauthorized", async () => {
    vi.mocked(api.fetchAdminReservations).mockResolvedValue({ error: "unauthorized" });

    render(<AdminReservationsTable />);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/admin/login"));
  });

  it("confirms a reservation and updates its badge", async () => {
    vi.mocked(api.fetchAdminReservations).mockResolvedValue({
      reservations: [sampleReservation],
    });
    vi.mocked(api.updateReservationStatus).mockResolvedValue({ status: "ok" });

    const user = userEvent.setup();
    render(<AdminReservationsTable />);

    await waitFor(() => expect(screen.getByText("Jane Doe")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => expect(api.updateReservationStatus).toHaveBeenCalledWith(1, "confirmed"));
    expect(await screen.findByText("confirmed")).toBeInTheDocument();
  });

  it("redirects to /admin/login after logout even if the request fails", async () => {
    vi.mocked(api.fetchAdminReservations).mockResolvedValue({
      reservations: [sampleReservation],
    });
    vi.mocked(api.adminLogout).mockRejectedValue(new Error("network error"));

    const user = userEvent.setup();
    render(<AdminReservationsTable />);

    await waitFor(() => expect(screen.getByText("Jane Doe")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/admin/login"));
  });
});
