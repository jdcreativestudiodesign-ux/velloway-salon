"use server";

import {
  formatDay,
  todayIn,
  validateBooking,
  type BookingInput,
  type FieldErrors,
} from "@/lib/booking";
import { SALON } from "@/lib/salon";

export type BookingState = {
  status: "idle" | "error" | "success";
  message: string;
  errors: FieldErrors;
  // Sent back after an error so the form keeps what the visitor typed.
  values: Partial<BookingInput>;
};

function readForm(formData: FormData): BookingInput {
  const read = (key: keyof BookingInput) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };
  return {
    name: read("name"),
    email: read("email"),
    service: read("service"),
    day: read("day"),
    time: read("time"),
    website: read("website"),
  };
}

export async function requestBooking(
  _previous: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const input = readForm(formData);
  const today = todayIn(SALON.timeZone, new Date());
  const result = validateBooking(input, today);

  if (!result.ok && result.spam) {
    // Looks like a bot: answer as if all went well, but do nothing.
    return { status: "success", message: "Thanks, we've received your request.", errors: {}, values: {} };
  }

  if (!result.ok) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: result.errors,
      // The hidden spam field is never sent back.
      values: {
        name: input.name,
        email: input.email,
        service: input.service,
        day: input.day,
        time: input.time,
      },
    };
  }

  // Demo site: a real project would send this to the salon's email or
  // booking system here. Nothing is stored or sent.
  const { booking } = result;
  return {
    status: "success",
    message: `Thanks, ${booking.name}. We've received your request for ${booking.serviceName.toLowerCase()} on ${formatDay(booking.day)}, ${booking.timeLabel.split(" (")[0].toLowerCase()}. We'll confirm by email.`,
    errors: {},
    values: {},
  };
}
