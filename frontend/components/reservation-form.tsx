"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Dictionary } from "@/content/get-dictionary";
import { checkAvailability, createReservation } from "@/lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

// Confirmed seating times, Monday–Friday. Keep in sync with
// backend/migrations/002_seed.sql's capacity_rules seed. Single source of
// truth for both the <select> options below and the zod validation.
const TIME_SLOTS = ["11:00:00", "14:00:00"] as const;

const schema = z.object({
  date: z.string().min(1),
  timeSlot: z.enum(TIME_SLOTS),
  partySize: z.coerce.number().int().min(1).max(20),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  notes: z.string().optional(),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

export function ReservationForm({ dictionary }: { dictionary: Dictionary }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({ resolver: zodResolver(schema) });

  const [result, setResult] = useState<"idle" | "success" | "no_capacity" | "error">("idle");
  const summaryRef = useRef<HTMLDivElement>(null);

  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (hasErrors) {
      summaryRef.current?.focus();
    }
  }, [hasErrors]);

  const onSubmit = async (values: FormValues) => {
    setResult("idle");
    try {
      const availability = await checkAvailability(values.date, values.timeSlot);
      if (availability.remaining < values.partySize) {
        setResult("no_capacity");
        return;
      }

      const response = await createReservation({
        date: values.date,
        timeSlot: values.timeSlot,
        partySize: values.partySize,
        name: values.name,
        email: values.email,
        phone: values.phone,
        notes: values.notes,
      });

      if ("error" in response) {
        setResult("error");
        return;
      }

      setResult("success");
    } catch {
      setResult("error");
    }
  };

  if (result === "success") {
    return (
      <div>
        <h2 className="font-display text-2xl">{dictionary.reservations.successTitle}</h2>
        <p className="font-body">{dictionary.reservations.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {hasErrors && (
        <div
          ref={summaryRef}
          role="alert"
          tabIndex={-1}
          className="mb-4 border border-[var(--color-vino-tinto)] p-4"
        >
          <h2 className="font-label uppercase text-sm">{dictionary.reservations.errorSummaryTitle}</h2>
          <ul>
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                <a href={`#field-${field}`}>{error?.message ?? field}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result === "no_capacity" && (
        <p className="mb-4 font-body text-[var(--color-vino-tinto)]">
          {dictionary.reservations.noCapacity}
        </p>
      )}

      {result === "error" && (
        <p className="mb-4 font-body text-[var(--color-vino-tinto)]">
          {dictionary.reservations.genericError}
        </p>
      )}

      <div className="mb-4">
        <label htmlFor="field-date" className="block font-label text-sm">
          {dictionary.reservations.dateLabel}
        </label>
        <Input
          className="h-11"
          id="field-date"
          type="date"
          min={new Date().toISOString().split("T")[0]}
          aria-invalid={!!errors.date}
          aria-describedby={errors.date ? "field-date-error" : undefined}
          {...register("date")}
        />
        {errors.date && (
          <p id="field-date-error" className="mt-1 text-sm text-[var(--color-vino-tinto)]">
            {errors.date.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="field-timeSlot" className="block font-label text-sm">
          {dictionary.reservations.timeLabel}
        </label>
        <select
          className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          id="field-timeSlot"
          aria-invalid={!!errors.timeSlot}
          aria-describedby={errors.timeSlot ? "field-timeSlot-error" : undefined}
          {...register("timeSlot")}
        >
          {TIME_SLOTS.map((slot) => (
            <option key={slot} value={slot}>
              {slot.slice(0, 5)}
            </option>
          ))}
        </select>
        {errors.timeSlot && (
          <p id="field-timeSlot-error" className="mt-1 text-sm text-[var(--color-vino-tinto)]">
            {errors.timeSlot.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="field-partySize" className="block font-label text-sm">
          {dictionary.reservations.partySizeLabel}
        </label>
        <Input
          className="h-11"
          id="field-partySize"
          type="number"
          min={1}
          max={20}
          aria-invalid={!!errors.partySize}
          aria-describedby={errors.partySize ? "field-partySize-error" : undefined}
          {...register("partySize")}
        />
        {errors.partySize && (
          <p id="field-partySize-error" className="mt-1 text-sm text-[var(--color-vino-tinto)]">
            {errors.partySize.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="field-name" className="block font-label text-sm">
          {dictionary.reservations.nameLabel}
        </label>
        <Input
          className="h-11"
          id="field-name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "field-name-error" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <p id="field-name-error" className="mt-1 text-sm text-[var(--color-vino-tinto)]">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="field-email" className="block font-label text-sm">
          {dictionary.reservations.emailLabel}
        </label>
        <Input
          className="h-11"
          id="field-email"
          type="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "field-email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p id="field-email-error" className="mt-1 text-sm text-[var(--color-vino-tinto)]">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="field-phone" className="block font-label text-sm">
          {dictionary.reservations.phoneLabel}
        </label>
        <Input
          className="h-11"
          id="field-phone"
          type="tel"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "field-phone-error" : undefined}
          {...register("phone")}
        />
        {errors.phone && (
          <p id="field-phone-error" className="mt-1 text-sm text-[var(--color-vino-tinto)]">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="field-notes" className="block font-label text-sm">
          {dictionary.reservations.notesLabel}
        </label>
        <textarea
          id="field-notes"
          className="min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          {...register("notes")}
        />
      </div>

      <Button type="submit" size="lg" className="h-11 px-8" disabled={isSubmitting}>
        {isSubmitting ? dictionary.reservations.submitting : dictionary.reservations.submit}
      </Button>
    </form>
  );
}
