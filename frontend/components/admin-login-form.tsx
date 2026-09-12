"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (formData: FormData) => {
    setSubmitting(true);
    setError(null);
    const username = String(formData.get("username") ?? "");
    const password = String(formData.get("password") ?? "");
    const result = await adminLogin(username, password);
    setSubmitting(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    router.push("/admin/reservations");
  };

  return (
    <form action={onSubmit}>
      {error && (
        <p role="alert" className="mb-4 text-[var(--color-vino-tinto)]">
          {error}
        </p>
      )}
      <div className="mb-4">
        <label htmlFor="username" className="block font-label text-sm">
          Username
        </label>
        <Input id="username" name="username" />
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="block font-label text-sm">
          Password
        </label>
        <Input id="password" name="password" type="password" />
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
