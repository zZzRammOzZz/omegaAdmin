import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-[11px] font-semibold tracking-[0.22em] text-gold uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="text-4xl text-ink">{title}</h1>
        {description ? <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "gold" | "success" | "danger" | "warning";
}) {
  const cls = {
    muted: "bg-[#f3eee4] text-muted",
    gold: "bg-gold-soft text-[#7a5a20]",
    success: "bg-[#e5f3ea] text-success",
    danger: "bg-[#fde8e6] text-danger",
    warning: "bg-[#f8ecd6] text-warning",
  }[tone];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${cls}`}>
      {children}
    </span>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`panel p-6 ${className}`}>{children}</div>;
}

export function Stat({
  label,
  value,
  hint,
  tone = "gold",
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "gold" | "danger" | "success" | "warning" | "ink";
}) {
  const color = {
    gold: "text-gold",
    danger: "text-danger",
    success: "text-success",
    warning: "text-warning",
    ink: "text-ink",
  }[tone];
  return (
    <div className="panel p-5">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">{label}</p>
      <p className={`serif mt-3 text-4xl ${color}`}>{value}</p>
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  multiline,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  multiline?: boolean;
  required?: boolean;
  placeholder?: string;
}) {
  const cls =
    "mt-1.5 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15";
  return (
    <label className="mb-4 block text-xs font-semibold tracking-wide text-muted uppercase">
      {label}
      {multiline ? (
        <textarea
          name={name}
          defaultValue={defaultValue ?? ""}
          rows={4}
          placeholder={placeholder}
          className={`${cls} min-h-24 normal-case`}
        />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={defaultValue ?? ""}
          required={required}
          placeholder={placeholder}
          className={`${cls} normal-case`}
        />
      )}
    </label>
  );
}

export function Button({
  children,
  variant = "primary",
  type = "submit",
  href,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  type?: "submit" | "button";
  href?: string;
}) {
  const cls = {
    primary: "bg-dark text-gold hover:bg-ink",
    secondary: "bg-white text-ink border border-border hover:bg-[#faf6ef]",
    danger: "bg-danger text-white hover:opacity-90",
    success: "bg-success text-white hover:opacity-90",
    ghost: "bg-transparent text-muted hover:text-ink",
  }[variant];
  const shared = `inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${cls}`;
  if (href) {
    return (
      <Link href={href} className={shared}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={shared}>
      {children}
    </button>
  );
}

export function Empty({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="panel px-6 py-16 text-center">
      <p className="serif text-2xl text-ink">{title ?? "Nothing here yet"}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{children}</p>
    </div>
  );
}

export function Tabs({ items, active }: { items: { href: string; label: string }[]; active: string }) {
  return (
    <div className="inline-flex rounded-full border border-border bg-white p-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
            active === item.href ? "bg-dark text-gold" : "text-muted hover:text-ink"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="mb-4 inline-flex items-center text-sm text-muted transition hover:text-gold">
      ← {children}
    </Link>
  );
}

export function DataTable({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="panel overflow-hidden p-0">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-[#faf6ef]">
            {headers.map((h) => (
              <th key={h} className="px-5 py-3 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}
