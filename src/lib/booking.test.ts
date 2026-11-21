import { describe, expect, it } from "vitest";
import { formatDay, parseDay, todayIn, validateBooking, type BookingInput } from "./booking";

// Fixed "today" so the tests never depend on the real date.
// 1 December 2026 is a Tuesday.
const TODAY = "2026-12-01";

function input(overrides: Partial<BookingInput> = {}): BookingInput {
  return {
    name: "Alex Rivera",
    email: "alex@example.com",
    service: "cut",
    day: "2026-12-02", // Wednesday
    time: "morning",
    website: "",
    ...overrides,
  };
}

function errorsFor(overrides: Partial<BookingInput>) {
  const result = validateBooking(input(overrides), TODAY);
  if (result.ok) throw new Error("Expected the booking to be rejected");
  return result.errors;
}

describe("validateBooking: a good request", () => {
  it("accepts a complete request and tidies the name and email", () => {
    const result = validateBooking(input({ name: "  Alex Rivera ", email: " alex@example.com " }), TODAY);
    expect(result).toEqual({
      ok: true,
      booking: {
        name: "Alex Rivera",
        email: "alex@example.com",
        serviceId: "cut",
        serviceName: "Cut and finish",
        day: "2026-12-02",
        timeId: "morning",
        timeLabel: "Morning (9:00 to 12:00)",
      },
    });
  });

  it("accepts today, if the salon is open today", () => {
    expect(validateBooking(input({ day: TODAY }), TODAY).ok).toBe(true);
  });

  it("accepts the last day of the booking window", () => {
    // 30 January 2027 is a Saturday, exactly 60 days ahead.
    expect(validateBooking(input({ day: "2027-01-30" }), TODAY).ok).toBe(true);
  });
});

describe("validateBooking: name and email", () => {
  it("asks for a name when it is blank or one letter", () => {
    expect(errorsFor({ name: "   " }).name).toBe("Please tell us your name.");
    expect(errorsFor({ name: "A" }).name).toBe("Please tell us your name.");
  });

  it("rejects a name over 80 characters", () => {
    expect(errorsFor({ name: "A".repeat(81) }).name).toMatch(/under 80/);
    expect(validateBooking(input({ name: "A".repeat(80) }), TODAY).ok).toBe(true);
  });

  it("asks for an email when it is blank", () => {
    expect(errorsFor({ email: "" }).email).toBe("Please add your email so we can confirm.");
  });

  it.each(["alex", "alex@", "alex@example", "alex @example.com", "@example.com"])(
    "rejects the badly formed email %j",
    (email) => {
      expect(errorsFor({ email }).email).toMatch(/doesn't look right/);
    },
  );
});

describe("validateBooking: service and time", () => {
  it("rejects a missing or unknown service", () => {
    expect(errorsFor({ service: "" }).service).toBe("Please choose a service.");
    expect(errorsFor({ service: "perm" }).service).toBe("Please choose a service.");
  });

  it("rejects a missing or unknown time", () => {
    expect(errorsFor({ time: "" }).time).toBe("Please choose a time of day.");
    expect(errorsFor({ time: "midnight" }).time).toBe("Please choose a time of day.");
  });

  it("allows an evening slot on a weekday", () => {
    expect(validateBooking(input({ day: "2026-12-04", time: "evening" }), TODAY).ok).toBe(true);
  });

  it("refuses an evening slot on Saturday, when the salon closes at 16:00", () => {
    expect(errorsFor({ day: "2026-12-05", time: "evening" }).time).toMatch(/close at 16:00 on Saturdays/);
  });
});

describe("validateBooking: the day", () => {
  it("asks for a day when none is chosen", () => {
    expect(errorsFor({ day: "" }).day).toBe("Please choose a day.");
  });

  it.each(["2026-02-30", "2026-13-01", "01/12/2026", "tomorrow"])("rejects %j as not a real date", (day) => {
    expect(errorsFor({ day }).day).toBe("Please choose a real date.");
  });

  it("rejects a day in the past", () => {
    expect(errorsFor({ day: "2026-11-28" }).day).toMatch(/already passed/);
  });

  it("rejects yesterday, the closest day in the past", () => {
    expect(errorsFor({ day: "2026-11-30" }).day).toMatch(/already passed/);
  });

  it("rejects a day beyond the 60-day window", () => {
    expect(errorsFor({ day: "2027-02-02" }).day).toMatch(/up to 60 days ahead/);
  });

  it.each([
    ["Sunday", "2026-12-06"],
    ["Monday", "2026-12-07"],
  ])("rejects %s, when the salon is closed", (_weekday, day) => {
    expect(errorsFor({ day }).day).toMatch(/closed on Sundays and Mondays/);
  });

  it("reports every problem at once", () => {
    const errors = errorsFor({ name: "", email: "x", service: "", day: "", time: "" });
    expect(Object.keys(errors).sort()).toEqual(["day", "email", "name", "service", "time"]);
  });
});

describe("validateBooking: spam", () => {
  it("flags the request as spam when the hidden field is filled in", () => {
    expect(validateBooking(input({ website: "https://spam.example" }), TODAY)).toEqual({
      ok: false,
      spam: true,
      errors: {},
    });
  });
});

describe("date helpers", () => {
  it("works out today's date in the salon's time zone, not the server's", () => {
    // 03:00 UTC on 2 December is still 1 December in New York.
    const now = new Date("2026-12-02T03:00:00Z");
    expect(todayIn("America/New_York", now)).toBe("2026-12-01");
    expect(todayIn("Asia/Taipei", now)).toBe("2026-12-02");
  });

  it("parses real dates and rejects impossible ones", () => {
    expect(parseDay("2028-02-29")).toBe(Date.UTC(2028, 1, 29)); // leap year
    expect(parseDay("2027-02-29")).toBeNull();
  });

  it("formats a day in plain English", () => {
    expect(formatDay("2026-12-02")).toBe("Wednesday 2 December");
  });
});
