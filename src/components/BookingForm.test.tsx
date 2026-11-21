import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { BookingState } from "@/app/actions";

// Replace the server action with a stand-in, so these tests check only the form.
const requestBooking = vi.fn<(previous: BookingState, data: FormData) => Promise<BookingState>>();
vi.mock("@/app/actions", () => ({ requestBooking: (p: BookingState, d: FormData) => requestBooking(p, d) }));

const { BookingForm } = await import("./BookingForm");

async function fillAndSend() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Your name"), "Alex Rivera");
  await user.type(screen.getByLabelText("Email"), "alex@example.com");
  await user.selectOptions(screen.getByLabelText("Service"), "cut");
  await user.type(screen.getByLabelText("Preferred day"), "2026-12-02");
  await user.selectOptions(screen.getByLabelText("Preferred time"), "morning");
  await user.click(screen.getByRole("button", { name: "Request booking" }));
}

describe("BookingForm", () => {
  it("gives every field a visible label", () => {
    render(<BookingForm />);
    for (const label of ["Your name", "Email", "Service", "Preferred day", "Preferred time"]) {
      expect(screen.getByLabelText(label)).toBeRequired();
    }
  });

  it("hides the spam trap from people and keyboard users", () => {
    render(<BookingForm />);
    const trap = document.getElementById("website") as HTMLInputElement;
    expect(trap).toHaveAttribute("tabindex", "-1");
    expect(trap.closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("sends the form and shows the confirmation", async () => {
    requestBooking.mockResolvedValueOnce({
      status: "success",
      message: "Thanks, Alex Rivera. We'll confirm by email.",
      errors: {},
      values: {},
    });
    render(<BookingForm />);
    await fillAndSend();

    expect(await screen.findByRole("status")).toHaveTextContent("Thanks, Alex Rivera.");
    const sent = requestBooking.mock.calls[0][1];
    expect(Object.fromEntries(sent)).toMatchObject({
      name: "Alex Rivera",
      email: "alex@example.com",
      service: "cut",
      day: "2026-12-02",
      time: "morning",
      website: "",
    });
  });

  it("shows each error next to its field and keeps what was typed", async () => {
    requestBooking.mockResolvedValueOnce({
      status: "error",
      message: "Please check the highlighted fields.",
      errors: { day: "We're closed on Sundays and Mondays. Please choose Tuesday to Saturday." },
      values: { name: "Alex Rivera", email: "alex@example.com", service: "cut", day: "2026-12-06", time: "morning" },
    });
    render(<BookingForm />);
    await fillAndSend();

    const day = await screen.findByLabelText("Preferred day");
    expect(await screen.findByText(/closed on Sundays and Mondays/)).toHaveAttribute("id", "day-error");
    expect(day).toHaveAttribute("aria-invalid", "true");
    expect(day).toHaveAttribute("aria-describedby", "day-error");
    expect(day).toHaveValue("2026-12-06");
    expect(screen.getByLabelText("Your name")).toHaveValue("Alex Rivera");
    expect(screen.getByLabelText("Your name")).not.toHaveAttribute("aria-invalid");
    expect(screen.getByRole("status")).toHaveTextContent("Please check the highlighted fields.");
  });
});
