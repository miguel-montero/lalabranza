import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReservationForm } from "./reservation-form";
import { getDictionary } from "@/content/get-dictionary";
import * as api from "@/lib/api";

vi.mock("@/lib/api");

describe("ReservationForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("shows a focusable error summary and per-field errors on empty submit", async () => {
    const dict = await getDictionary("en");
    render(<ReservationForm dictionary={dict} />);

    fireEvent.click(screen.getByRole("button", { name: dict.reservations.submit }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(dict.reservations.errorSummaryTitle);
    });
    expect(screen.getByLabelText(dict.reservations.nameLabel)).toBeInvalid();
  });

  it("submits successfully when the form is valid and capacity remains", async () => {
    vi.mocked(api.checkAvailability).mockResolvedValue({ remaining: 4 });
    vi.mocked(api.createReservation).mockResolvedValue({ status: "pending", id: 1 });

    const dict = await getDictionary("en");
    const user = userEvent.setup();
    render(<ReservationForm dictionary={dict} />);

    await user.type(screen.getByLabelText(dict.reservations.dateLabel), "2026-09-17");
    await user.selectOptions(screen.getByLabelText(dict.reservations.timeLabel), "13:00:00");
    await user.type(screen.getByLabelText(dict.reservations.partySizeLabel), "2");
    await user.type(screen.getByLabelText(dict.reservations.nameLabel), "Jane Doe");
    await user.type(screen.getByLabelText(dict.reservations.emailLabel), "jane@example.com");
    await user.type(screen.getByLabelText(dict.reservations.phoneLabel), "+15551234567");

    await user.click(screen.getByRole("button", { name: dict.reservations.submit }));

    await waitFor(() => {
      expect(screen.getByText(dict.reservations.successTitle)).toBeInTheDocument();
    });
    expect(api.createReservation).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Jane Doe", partySize: 2 }),
    );
  });

  it("shows the no-capacity message when the party size exceeds remaining capacity", async () => {
    vi.mocked(api.checkAvailability).mockResolvedValue({ remaining: 1 });

    const dict = await getDictionary("en");
    const user = userEvent.setup();
    render(<ReservationForm dictionary={dict} />);

    await user.type(screen.getByLabelText(dict.reservations.dateLabel), "2026-09-17");
    await user.selectOptions(screen.getByLabelText(dict.reservations.timeLabel), "13:00:00");
    await user.type(screen.getByLabelText(dict.reservations.partySizeLabel), "4");
    await user.type(screen.getByLabelText(dict.reservations.nameLabel), "Jane Doe");
    await user.type(screen.getByLabelText(dict.reservations.emailLabel), "jane@example.com");
    await user.type(screen.getByLabelText(dict.reservations.phoneLabel), "+15551234567");

    await user.click(screen.getByRole("button", { name: dict.reservations.submit }));

    await waitFor(() => {
      expect(screen.getByText(dict.reservations.noCapacity)).toBeInTheDocument();
    });
    expect(api.createReservation).not.toHaveBeenCalled();
  });

  it("shows a generic error message when createReservation returns an error", async () => {
    vi.mocked(api.checkAvailability).mockResolvedValue({ remaining: 4 });
    vi.mocked(api.createReservation).mockResolvedValue({ error: "Could not create reservation" });

    const dict = await getDictionary("en");
    const user = userEvent.setup();
    render(<ReservationForm dictionary={dict} />);

    await user.type(screen.getByLabelText(dict.reservations.dateLabel), "2026-09-17");
    await user.selectOptions(screen.getByLabelText(dict.reservations.timeLabel), "13:00:00");
    await user.type(screen.getByLabelText(dict.reservations.partySizeLabel), "2");
    await user.type(screen.getByLabelText(dict.reservations.nameLabel), "Jane Doe");
    await user.type(screen.getByLabelText(dict.reservations.emailLabel), "jane@example.com");
    await user.type(screen.getByLabelText(dict.reservations.phoneLabel), "+15551234567");

    await user.click(screen.getByRole("button", { name: dict.reservations.submit }));

    await waitFor(() => {
      expect(screen.getByText(dict.reservations.genericError)).toBeInTheDocument();
    });
  });

  it("shows a generic error message when checkAvailability rejects", async () => {
    vi.mocked(api.checkAvailability).mockRejectedValue(new Error("network error"));

    const dict = await getDictionary("en");
    const user = userEvent.setup();
    render(<ReservationForm dictionary={dict} />);

    await user.type(screen.getByLabelText(dict.reservations.dateLabel), "2026-09-17");
    await user.selectOptions(screen.getByLabelText(dict.reservations.timeLabel), "13:00:00");
    await user.type(screen.getByLabelText(dict.reservations.partySizeLabel), "2");
    await user.type(screen.getByLabelText(dict.reservations.nameLabel), "Jane Doe");
    await user.type(screen.getByLabelText(dict.reservations.emailLabel), "jane@example.com");
    await user.type(screen.getByLabelText(dict.reservations.phoneLabel), "+15551234567");

    await user.click(screen.getByRole("button", { name: dict.reservations.submit }));

    await waitFor(() => {
      expect(screen.getByText(dict.reservations.genericError)).toBeInTheDocument();
    });
    expect(api.createReservation).not.toHaveBeenCalled();
  });
});
