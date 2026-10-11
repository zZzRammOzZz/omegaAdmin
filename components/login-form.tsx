"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/actions";

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, action, pending] = useActionState(signIn, initialError ? { error: initialError } : null);

  return (
    <form action={action} className="space-y-5">
      <label className="block text-xs font-semibold tracking-wide text-muted uppercase">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1.5 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm normal-case outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
        />
      </label>
      <label className="block text-xs font-semibold tracking-wide text-muted uppercase">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1.5 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm normal-case outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
        />
      </label>
      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-dark py-3 text-sm font-semibold text-gold transition hover:bg-ink disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Enter dashboard"}
      </button>
    </form>
  );
}
