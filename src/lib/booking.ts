// Booking request rules. Pure functions with no network or clock access,
// so every rule can be tested with a fixed "today".

import { OPEN_DAYS, SALON, SERVICES, TIMES } from "./salon";

export type BookingField = "name" | "email" | "service" | "day" | "time";

export type BookingInput = Record<BookingField, string> & {
  // Hidden "website" field. People never see it; simple spam bots fill it in.
  website: string;
};

export type FieldErrors = Partial<Record<BookingField, string>>;

export type Booking = {
  name: string;
  email: string;
  serviceId: string;
  serviceName: string;
  day: string; // YYYY-MM-DD
  timeId: string;
  timeLabel: string;
};

export type ValidationResult =
  | { ok: true; booking: Booking }
  | { ok: false; spam: boolean; errors: FieldErrors };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const SATURDAY = 6;

/** Today's date in the salon's time zone, as YYYY-MM-DD. */
export function todayIn(timeZone: string, now: Date): string {
  // The en-CA locale formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Parses YYYY-MM-DD into a UTC timestamp, or null if it is not a real date. */
export function parseDay(value: string): number | null {
  const match = DAY_PATTERN.exec(value);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const time = Date.UTC(year, month - 1, day);
  const check = new Date(time);
  // Rejects dates such as 2026-02-30, which Date.UTC would roll into March.
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return time;
}

/** "Tuesday 2 December" for a YYYY-MM-DD date. */
export function formatDay(value: string): string {
  const time = parseDay(value);
  if (time === null) return value;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(time));
}

function checkDay(day: string, today: string): string | undefined {
  if (day === "") return "Please choose a day.";
  const chosen = parseDay(day);
  const start = parseDay(today);
  if (chosen === null || start === null) return "Please choose a real date.";
  const daysAhead = Math.round((chosen - start) / MS_PER_DAY);
  if (daysAhead < 0) return "That day has already passed. Please choose another.";
  if (daysAhead > SALON.bookingWindowDays) {
    return `We take bookings up to ${SALON.bookingWindowDays} days ahead. Please choose an earlier day.`;
  }
  const weekday = new Date(chosen).getUTCDay();
  if (!(OPEN_DAYS as readonly number[]).includes(weekday)) {
    return "We're closed on Sundays and Mondays. Please choose Tuesday to Saturday.";
  }
  return undefined;
}

/**
 * Checks a booking request. `today` is the salon's date (YYYY-MM-DD),
 * passed in so tests can fix it.
 */
export function validateBooking(input: BookingInput, today: string): ValidationResult {
  if (input.website.trim() !== "") {
    return { ok: false, spam: true, errors: {} };
  }

  const name = input.name.trim();
  const email = input.email.trim();
  const errors: FieldErrors = {};

  if (name.length < 2) errors.name = "Please tell us your name.";
  else if (name.length > 80) errors.name = "Please keep your name under 80 characters.";

  if (email === "") errors.email = "Please add your email so we can confirm.";
  else if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    errors.email = "That email doesn't look right. Please check it.";
  }

  const service = SERVICES.find((s) => s.id === input.service);
  if (!service) errors.service = "Please choose a service.";

  const dayError = checkDay(input.day, today);
  if (dayError) errors.day = dayError;

  const time = TIMES.find((t) => t.id === input.time);
  if (!time) {
    errors.time = "Please choose a time of day.";
  } else if (time.id === "evening" && !dayError) {
    const chosen = parseDay(input.day);
    if (chosen !== null && new Date(chosen).getUTCDay() === SATURDAY) {
      errors.time = "We close at 16:00 on Saturdays. Please choose morning or afternoon.";
    }
  }

  if (Object.keys(errors).length > 0 || !service || !time) {
    return { ok: false, spam: false, errors };
  }

  return {
    ok: true,
    booking: {
      name,
      email,
      serviceId: service.id,
      serviceName: service.name,
      day: input.day,
      timeId: time.id,
      timeLabel: time.label,
    },
  };
}
