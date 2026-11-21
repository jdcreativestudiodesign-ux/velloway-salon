import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { requestBooking, type BookingState } from "./actions";

const idle: BookingState = { status: "idle", message: "", errors: {}, values: {} };

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const good = {
  name: "Alex Rivera",
  email: "alex@example.com",
  service: "colour",
  day: "2026-12-04", // Friday
  time: "evening",
  website: "",
};

describe("requestBooking (server action)", () => {
  beforeEach(() => {
    // 15:00 UTC on Tuesday 1 December 2026 is 10:00 in New York.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-12-01T15:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("confirms a good request in plain English", async () => {
    const state = await requestBooking(idle, form(good));
    expect(state).toEqual({
      status: "success",
      message:
        "Thanks, Alex Rivera. We've received your request for colour on Friday 4 December, evening. We'll confirm by email.",
      errors: {},
      values: {},
    });
  });

  it("returns field errors and keeps what the visitor typed", async () => {
    const state = await requestBooking(idle, form({ ...good, email: "not-an-email", day: "2026-12-06" }));
    expect(state.status).toBe("error");
    expect(state.errors).toEqual({
      email: "That email doesn't look right. Please check it.",
      day: "We're closed on Sundays and Mondays. Please choose Tuesday to Saturday.",
    });
    expect(state.values).toEqual({
      name: "Alex Rivera",
      email: "not-an-email",
      service: "colour",
      day: "2026-12-06",
      time: "evening",
    });
  });

  it("uses the salon's date, so late-evening New York requests for today still work", async () => {
    // 03:00 UTC on Wednesday 2 December is still Tuesday evening in New York.
    vi.setSystemTime(new Date("2026-12-02T03:00:00Z"));
    const state = await requestBooking(idle, form({ ...good, day: "2026-12-01", time: "morning" }));
    expect(state.status).toBe("success");
  });

  it("treats missing fields as empty rather than crashing", async () => {
    const state = await requestBooking(idle, new FormData());
    expect(state.status).toBe("error");
    expect(Object.keys(state.errors).sort()).toEqual(["day", "email", "name", "service", "time"]);
  });

  it("answers bots politely but never echoes their data back", async () => {
    const state = await requestBooking(idle, form({ ...good, website: "spam" }));
    expect(state).toEqual({ status: "success", message: "Thanks, we've received your request.", errors: {}, values: {} });
  });
});
