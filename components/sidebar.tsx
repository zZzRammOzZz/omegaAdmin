"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions";
import type { Profile } from "@/lib/database.types";

const LINKS = [
  { href: "/", label: "Overview", icon: IconGrid },
  { href: "/clients", label: "Clients", icon: IconBuilding },
  { href: "/visits", label: "Visits", icon: IconClipboard },
  { href: "/pending", label: "Pending", icon: IconAlert },
  { href: "/requests", label: "Approvals", icon: IconCheck },
  { href: "/team", label: "Team", icon: IconUsers },
  { href: "/settings", label: "Settings", icon: IconGear },
];

export function Sidebar({ profile, pendingCount }: { profile: Profile; pendingCount: number }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-72 shrink-0 flex-col bg-dark text-white">
      <div className="h-1 bg-linear-to-r from-gold via-[#f0d59a] to-gold" />
      <div className="flex items-center gap-3 px-6 py-6">
        <Image src="/logo.png" alt="" width={44} height={44} className="rounded-xl ring-1 ring-white/10" />
        <div>
          <div className="serif text-xl leading-none text-gold">Omega</div>
          <div className="mt-1 text-[11px] tracking-[0.22em] text-[#9a9184] uppercase">Outdoor · Admin</div>
        </div>
      </div>
      <div className="mx-6 hairline" />
      <nav className="flex-1 space-y-1 px-4 py-5">
        {LINKS.map((l) => {
          const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active ? "bg-white/10 text-gold" : "text-[#c9c2b6] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className={active ? "text-gold" : "text-[#8a8378]"} />
              <span className="flex-1 font-medium">{l.label}</span>
              {l.href === "/pending" && pendingCount > 0 ? (
                <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-dark">
                  {pendingCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="mx-6 hairline" />
      <div className="px-6 py-5">
        <div className="text-sm font-semibold">{profile.full_name || "Admin"}</div>
        <div className="mt-0.5 text-xs text-[#8a8378]">Field operations</div>
        <form action={signOut} className="mt-3">
          <button type="submit" className="text-xs text-[#8a8378] transition hover:text-gold">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

function IconGrid({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IconBuilding({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 21V7l8-4 8 4v14" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}
function IconClipboard({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4V3h6v1" />
      <path d="M9 10h6M9 14h4" />
    </svg>
  );
}
function IconAlert({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 9v4" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" />
      <path d="M10.3 4.8 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.8a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}
function IconCheck({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function IconUsers({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19c.6-3 3-5 6-5s5.4 2 6 5" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M16 19c.4-1.8 1.7-3.2 3.5-3.8" />
    </svg>
  );
}
function IconGear({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.7 1 1.2 1.8 1.2H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}
