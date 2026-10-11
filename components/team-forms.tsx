"use client";

import { useActionState, useState } from "react";
import { createUser, deleteUser, setAccountStatus, toggleRole } from "@/lib/actions";
import type { AccountStatus, UserRole } from "@/lib/database.types";
import { Button } from "@/components/ui";

function randomPassword() {
  const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export function CreateUserForm() {
  const [state, action, pending] = useActionState(createUser, null);
  const [password, setPassword] = useState("");

  return (
    <form action={action} className="grid gap-x-4 sm:grid-cols-2">
      <label className="mb-4 block text-xs font-semibold tracking-wide text-muted uppercase">
        Full name
        <input
          name="full_name"
          required
          className="mt-1.5 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm font-normal normal-case outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
        />
      </label>
      <label className="mb-4 block text-xs font-semibold tracking-wide text-muted uppercase">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="off"
          className="mt-1.5 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm font-normal normal-case outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
        />
      </label>
      <label className="mb-4 block text-xs font-semibold tracking-wide text-muted uppercase">
        Temporary password
        <div className="mt-1.5 flex gap-2">
          <input
            name="password"
            type="text"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm font-normal normal-case outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
          />
          <button
            type="button"
            onClick={() => setPassword(randomPassword())}
            className="shrink-0 rounded-full border border-border px-3 text-xs font-semibold text-ink hover:bg-[#faf6ef]"
          >
            Generate
          </button>
        </div>
      </label>
      <label className="mb-4 block text-xs font-semibold tracking-wide text-muted uppercase">
        Role
        <select
          name="role"
          defaultValue="user"
          className="mt-1.5 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm font-normal normal-case outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
        >
          <option value="user">Technician</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <div className="sm:col-span-2">
        {state?.error ? <p className="mb-3 text-sm text-danger">{state.error}</p> : null}
        <Button>{pending ? "Creating…" : "Create account"}</Button>
      </div>
    </form>
  );
}

export function TeamMemberActions({
  id,
  role,
  status,
  isSelf,
}: {
  id: string;
  role: UserRole;
  status: AccountStatus;
  isSelf: boolean;
}) {
  if (isSelf) return <span className="text-xs text-muted">You</span>;

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <form action={toggleRole}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="role" value={role} />
        <Button variant="ghost">{role === "admin" ? "Make user" : "Make admin"}</Button>
      </form>
      {status === "active" ? (
        <form action={setAccountStatus}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value="suspended" />
          <Button variant="secondary">Suspend</Button>
        </form>
      ) : (
        <>
          <form action={setAccountStatus}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value="active" />
            <Button variant="secondary">Restore</Button>
          </form>
          <form
            action={deleteUser}
            onSubmit={(e) => {
              if (!confirm("Delete this account permanently? Visit history stays. They cannot sign in again.")) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="id" value={id} />
            <Button variant="danger">Delete</Button>
          </form>
        </>
      )}
    </div>
  );
}
