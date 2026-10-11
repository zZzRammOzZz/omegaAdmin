import Link from "next/link";
import { AreaChart, BarRow, Donut, WeekBars } from "@/components/charts";
import { Card, Empty, PageHeader, Stat } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { VISIT_TYPE_LABEL, fmtDateTime, startOfDay } from "@/lib/labels";
import type { VisitType } from "@/lib/database.types";

const TYPE_COLOR: Record<VisitType, string> = {
  installation: "#c9a05a",
  follow_up: "#8a6d3b",
  issue_fix: "#b42318",
  other: "#b9b1a4",
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function daysAgo(n: number, from = startOfDay()) {
  const d = new Date(from);
  d.setDate(from.getDate() - n);
  return d;
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default async function OverviewPage() {
  const { supabase } = await requireAdmin();
  const today = startOfDay();
  const week = daysAgo(6, today);
  const month = new Date(today.getFullYear(), today.getMonth(), 1);
  const fourteen = daysAgo(13, today);
  const since = month < fourteen ? month : fourteen;

  const [{ data: visits }, { data: pending }, { count: requestCount }, { count: clientCount }, { data: team }] =
    await Promise.all([
      supabase
        .from("visits")
        .select(
          "id, visit_type, visited_at, pending, pending_status, user_id, client_id, clients:client_id(name), profiles:user_id(full_name)",
        )
        .gte("visited_at", since.toISOString())
        .order("visited_at", { ascending: false })
        .limit(1000),
      supabase.from("pending_items").select("*"),
      supabase.from("edit_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("clients").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*"),
    ]);

  const rows = visits ?? [];
  const pendingItems = pending ?? [];
  const people = team ?? [];
  const inRange = (iso: string, from: Date) => new Date(iso) >= from;

  const todayVisits = rows.filter((v) => inRange(v.visited_at, today));
  const weekVisits = rows.filter((v) => inRange(v.visited_at, week));
  const monthVisits = rows.filter((v) => inRange(v.visited_at, month));
  const openPending = pendingItems.filter((p) => p.pending_status === "open");
  const doneToday = pendingItems.filter(
    (p) => p.pending_status === "done" && p.pending_done_at && inRange(p.pending_done_at, today),
  ).length;
  const sitesThisMonth = new Set(monthVisits.map((v) => v.client_id)).size;
  const issueRate = monthVisits.length
    ? Math.round((monthVisits.filter((v) => v.visit_type === "issue_fix").length / monthVisits.length) * 100)
    : 0;
  const oldestOpen = openPending
    .slice()
    .sort((a, b) => new Date(a.visited_at).getTime() - new Date(b.visited_at).getTime())[0];
  const oldestDays = oldestOpen
    ? Math.max(0, Math.round((today.getTime() - new Date(oldestOpen.visited_at).getTime()) / 86_400_000))
    : 0;
  const activeTechs = people.filter((p) => p.status === "active" && p.role === "user").length;
  const suspended = people.filter((p) => p.status === "suspended").length;

  const trend = Array.from({ length: 14 }, (_, i) => {
    const d = daysAgo(13 - i, today);
    const count = rows.filter((v) => dayKey(new Date(v.visited_at)) === dayKey(d)).length;
    return { label: `${d.getDate()}/${d.getMonth() + 1}`, value: count };
  });

  const byType = (Object.keys(VISIT_TYPE_LABEL) as VisitType[]).map((k) => ({
    label: VISIT_TYPE_LABEL[k],
    value: monthVisits.filter((v) => v.visit_type === k).length,
    color: TYPE_COLOR[k],
  }));

  const byTech = Object.values(
    monthVisits.reduce<Record<string, { label: string; value: number }>>((acc, v) => {
      const key = v.user_id ?? "unknown";
      const label = (v.profiles as { full_name: string } | null)?.full_name || "Unknown";
      acc[key] ??= { label, value: 0 };
      acc[key].value += 1;
      return acc;
    }, {}),
  ).sort((a, b) => b.value - a.value);

  const weekday = DAY_LABELS.map((label, i) => ({
    label,
    value: monthVisits.filter((v) => new Date(v.visited_at).getDay() === i).length,
    highlight: i === today.getDay(),
  }));

  const pendingAge = [
    { label: "0–2 days", value: 0, color: "#2f6b45" },
    { label: "3–7 days", value: 0, color: "#c9a05a" },
    { label: "Over a week", value: 0, color: "#b42318" },
  ];
  for (const p of openPending) {
    const days = Math.max(0, Math.round((today.getTime() - new Date(p.visited_at).getTime()) / 86_400_000));
    if (days <= 2) pendingAge[0].value += 1;
    else if (days <= 7) pendingAge[1].value += 1;
    else pendingAge[2].value += 1;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Command"
        title="Field overview"
        description="Volume, mix, follow-through, and who is carrying the month."
      />

      <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-6">
        <Stat label="Visits today" value={todayVisits.length} hint={`${weekVisits.length} this week`} />
        <Stat label="Sites this month" value={sitesThisMonth} hint={`${clientCount ?? 0} on file`} />
        <Stat label="Issue-fix rate" value={`${issueRate}%`} tone="danger" hint="Of this month’s visits" />
        <Stat
          label="Open pending"
          value={openPending.length}
          tone="warning"
          hint={oldestOpen ? `Oldest ${oldestDays}d` : "Nothing aging"}
        />
        <Stat label="Closed today" value={doneToday} tone="success" hint="Pending marked done" />
        <Stat
          label="Approvals"
          value={requestCount ?? 0}
          tone="ink"
          hint={`${activeTechs} techs${suspended ? ` · ${suspended} suspended` : ""}`}
        />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h2 className="serif text-2xl">Last 14 days</h2>
          <p className="mb-4 mt-1 text-sm text-muted">{rows.length} visits in this window</p>
          <AreaChart data={trend} />
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="serif text-2xl">Visit mix</h2>
          <p className="mb-4 mt-1 text-sm text-muted">This month</p>
          {monthVisits.length === 0 ? <Empty>No visits this month.</Empty> : <Donut slices={byType} />}
        </Card>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="serif text-2xl">By technician</h2>
          <p className="mb-5 mt-1 text-sm text-muted">{monthVisits.length} visits since {month.toLocaleDateString()}</p>
          {byTech.length === 0 ? <Empty>No visits this month.</Empty> : <BarRow data={byTech} />}
        </Card>
        <Card>
          <h2 className="serif text-2xl">Weekdays</h2>
          <p className="mb-5 mt-1 text-sm text-muted">When the team is in the field</p>
          <WeekBars data={weekday} />
        </Card>
        <Card>
          <h2 className="serif text-2xl">Pending age</h2>
          <p className="mb-5 mt-1 text-sm text-muted">Open items by how long they have sat</p>
          {openPending.length === 0 ? <Empty>All clear.</Empty> : <BarRow data={pendingAge} />}
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="serif text-2xl">Latest visits</h2>
          <Link href="/visits" className="text-sm font-semibold text-gold hover:underline">
            View all
          </Link>
        </div>
        {rows.length === 0 ? (
          <Empty>No visits yet.</Empty>
        ) : (
          <ul className="-mx-2">
            {rows.slice(0, 8).map((v) => (
              <li key={v.id}>
                <Link
                  href={`/visits/${v.id}`}
                  className="flex items-center justify-between rounded-xl px-2 py-3 transition hover:bg-[#faf6ef]"
                >
                  <div>
                    <div className="font-semibold">{(v.clients as { name: string } | null)?.name ?? "Unknown"}</div>
                    <div className="text-xs text-muted">
                      {VISIT_TYPE_LABEL[v.visit_type]} · {(v.profiles as { full_name: string } | null)?.full_name ?? "Unknown"}
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted">{fmtDateTime(v.visited_at)}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
