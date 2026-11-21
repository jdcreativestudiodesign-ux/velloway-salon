"use client";

import { useActionState } from "react";
import { requestBooking, type BookingState } from "@/app/actions";
import type { BookingField } from "@/lib/booking";
import { SERVICES, TIMES } from "@/lib/salon";

const initialState: BookingState = { status: "idle", message: "", errors: {}, values: {} };

function errorProps(state: BookingState, field: BookingField) {
  const error = state.errors[field];
  return error
    ? { "aria-invalid": true as const, "aria-describedby": `${field}-error` }
    : {};
}

function FieldError({ state, field }: { state: BookingState; field: BookingField }) {
  const error = state.errors[field];
  if (!error) return null;
  return (
    <p id={`${field}-error`} className="field-error">
      {error}
    </p>
  );
}

export function BookingForm() {
  const [state, formAction, pending] = useActionState(requestBooking, initialState);
  const values = state.values;

  return (
    <form action={formAction} className="booking-form" aria-label="Booking request">
      <div className="field">
        <label htmlFor="name">Your name</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          maxLength={80}
          defaultValue={values.name ?? ""}
          {...errorProps(state, "name")}
        />
        <FieldError state={state} field="name" />
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          defaultValue={values.email ?? ""}
          {...errorProps(state, "email")}
        />
        <FieldError state={state} field="email" />
      </div>

      <div className="field">
        <label htmlFor="service">Service</label>
        <select
          id="service"
          name="service"
          required
          defaultValue={values.service ?? ""}
          {...errorProps(state, "service")}
        >
          <option value="" disabled>
            Choose a service
          </option>
          {SERVICES.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} ({service.price})
            </option>
          ))}
        </select>
        <FieldError state={state} field="service" />
      </div>

      <div className="field">
        <label htmlFor="day">Preferred day</label>
        <input
          id="day"
          name="day"
          type="date"
          required
          defaultValue={values.day ?? ""}
          {...errorProps(state, "day")}
        />
        <FieldError state={state} field="day" />
      </div>

      <div className="field field-wide">
        <label htmlFor="time">Preferred time</label>
        <select
          id="time"
          name="time"
          required
          defaultValue={values.time ?? ""}
          {...errorProps(state, "time")}
        >
          <option value="" disabled>
            Choose a time of day
          </option>
          {TIMES.map((time) => (
            <option key={time.id} value={time.id}>
              {time.label}
            </option>
          ))}
        </select>
        <FieldError state={state} field="time" />
      </div>

      {/* Hidden from people and screen readers; only bots fill it in. */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" className="button button-primary field-wide" disabled={pending}>
        {pending ? "Sending..." : "Request booking"}
      </button>

      <p
        role="status"
        className={`form-status form-status-${state.status} field-wide`}
      >
        {state.message}
      </p>
    </form>
  );
}
