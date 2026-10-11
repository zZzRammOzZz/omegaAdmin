import Link from "next/link";
import { TextInput } from "@/components/text-input";
import { Badge, Button, Card, Empty, PageHeader, Tabs } from "@/components/ui";
import { setPendingDone } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { fmtDate } from "@/lib/labels";

export default async function PendingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = status === "done" ? "done" : "open";
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("pending_items")
    .select("*")
    .eq("pending_status", filter)
    .order(filter === "open" ? "visited_at" : "pending_done_at", { ascending: filter === "open" });

  return (
    <div>
      <PageHeader
        eyebrow="Follow-through"
        title="Pending work"
        description="Items the team left open. Anyone can close them; only admins can reopen."
        actions={
          <Tabs
            active={filter === "done" ? "/pending?status=done" : "/pending"}
            items={[
              { href: "/pending", label: "Open" },
              { href: "/pending?status=done", label: "Done" },
            ]}
          />
        }
      />
      {(data ?? []).length === 0 ? (
        <Empty title={filter === "open" ? "All clear" : "No history yet"}>
          {filter === "open" ? "Nothing pending across the team." : "Completed items will show up here."}
        </Empty>
      ) : (
        <div className="grid gap-4">
          {(data ?? []).map((p) => (
            <Card key={p.visit_id} className={p.pending_status === "open" ? "border-l-4 border-l-warning" : ""}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/clients/${p.client_id}`} className="serif text-2xl hover:text-gold">
                    {p.client_name}
                  </Link>
                  <div className="mt-1 text-xs text-muted">
                    Reported {fmtDate(p.visited_at)} by {p.reported_by_name ?? "Unknown"}
                  </div>
                  <p className="mt-3 text-sm leading-6">{p.pending}</p>
                  {p.pending_status === "done" ? (
                    <p className="mt-3 text-xs text-success">
                      Done {fmtDate(p.pending_done_at)} by {p.done_by_name}
                      {p.pending_done_note ? ` — ${p.pending_done_note}` : ""}
                    </p>
                  ) : null}
                </div>
                <Badge tone={p.pending_status === "open" ? "warning" : "success"}>
                  {p.pending_status === "open" ? "Open" : "Done"}
                </Badge>
              </div>
              {p.pending_status === "open" ? (
                <form action={setPendingDone} className="mt-5 flex flex-wrap gap-2">
                  <input type="hidden" name="visit_id" value={p.visit_id} />
                  <input type="hidden" name="done" value="true" />
                  <TextInput
                    name="note"
                    placeholder="What was done? (optional)"
                    className="min-w-56 flex-1 rounded-full border border-border px-4 py-2 text-sm outline-none focus:border-gold"
                  />
                  <Button variant="success">Mark done</Button>
                  <Button href={`/visits/${p.visit_id}`} variant="secondary">
                    Open visit
                  </Button>
                </form>
              ) : (
                <div className="mt-5">
                  <Button href={`/visits/${p.visit_id}`} variant="secondary">
                    Open visit
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
