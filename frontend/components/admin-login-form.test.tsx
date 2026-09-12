import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminLoginForm } from "./admin-login-form";
import * as api from "@/lib/api";

vi.mock("@/lib/api");
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));

describe("AdminLoginForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("redirects to the reservations list on successful login", async () => {
    vi.mocked(api.adminLogin).mockResolvedValue({ status: "ok" });
    const user = userEvent.setup();
    render(<AdminLoginForm />);

    await user.type(screen.getByLabelText("Username"), "staff");
    await user.type(screen.getByLabelText("Password"), "changeme123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/admin/reservations"));
  });

  it("shows an error message on failed login", async () => {
    vi.mocked(api.adminLogin).mockResolvedValue({ error: "Invalid credentials" });
    const user = userEvent.setup();
    render(<AdminLoginForm />);

    await user.type(screen.getByLabelText("Username"), "staff");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials"));
    expect(pushMock).not.toHaveBeenCalled();
  });
});
