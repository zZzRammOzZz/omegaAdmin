import { notFound } from "next/navigation";
import { TextInput } from "@/components/text-input";
import { BackLink, Badge, Button, Card, Field, PageHeader } from "@/components/ui";
import { deleteVisit, setPendingDone, updateVisit } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { VISIT_TYPE_LABEL, fmtDateTime } from "@/lib/labels";

export default async function VisitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: visit } = await supabase
    .from("visits")
    .select("*, clients:client_id(*), profiles:user_id(full_name), done_by:pending_done_by(full_name)")
    .eq("id", id)
    .single();
  if (!visit) notFound();
  const client = visit.clients as { id: string; name: string; company_id: string } | null;

  return (
    <div className="max-w-3xl">
      <BackLink href="/visits">Visits</BackLink>
      <PageHeader
        eyebrow={VISIT_TYPE_LABEL[visit.visit_type]}
        title={client?.name ?? "Visit"}
        description={`${(visit.profiles as { full_name: string } | null)?.full_name} · ${fmtDateTime(visit.visited_at)}`}
        actions={
          client ? (
            <Button href={`/clients/${client.id}`} variant="secondary">
              Open client
            </Button>
          ) : null
        }
      />

      {visit.pending_status !== "none" ? (
        <Card className={`mb-6 ${visit.pending_status === "open" ? "border-l-4 border-l-warning" : ""}`}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="serif text-2xl">Pending work</h2>
            {visit.pending_status === "open" ? <Badge tone="warning">Open</Badge> : <Badge tone="success">Done</Badge>}
          </div>
          <p className={visit.pending_status === "done" ? "text-sm text-muted line-through" : "text-sm leading-6"}>
            {visit.pending}
          </p>
          {visit.pending_status === "done" ? (
            <p className="mt-3 text-xs text-success">
              Done {fmtDateTime(visit.pending_done_at)} by{" "}
              {(visit.done_by as { full_name: string } | null)?.full_name ?? "unknown"}
              {visit.pending_done_note ? ` — ${visit.pending_done_note}` : ""}
            </p>
          ) : null}
          <form action={setPendingDone} className="mt-5 flex flex-wrap gap-2">
            <input type="hidden" name="visit_id" value={visit.id} />
            {visit.pending_status === "open" ? (
              <>
                <TextInput
                  name="note"
                  placeholder="What was done? (optional)"
                  className="min-w-56 flex-1 rounded-full border border-border px-4 py-2 text-sm outline-none focus:border-gold"
                />
                <input type="hidden" name="done" value="true" />
                <Button variant="success">Mark done</Button>
              </>
            ) : (
              <>
                <input type="hidden" name="done" value="false" />
                <Button variant="secondary">Reopen</Button>
              </>
            )}
          </form>
        </Card>
      ) : null}

      <Card>
        <h2 className="serif mb-5 text-2xl">Edit visit</h2>
        <form action={updateVisit}>
          <input type="hidden" name="id" value={visit.id} />
          <label className="mb-4 block text-xs font-semibold tracking-wide text-muted uppercase">
            Visit type
            <select
              name="visit_type"
              defaultValue={visit.visit_type}
              className="mt-1.5 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm font-normal normal-case text-foreground outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
            >
              {Object.entries(VISIT_TYPE_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <Field label="Work done" name="work_done" defaultValue={visit.work_done} multiline />
          <Field label="Pending" name="pending" defaultValue={visit.pending} multiline />
          <Field label="Notes" name="notes" defaultValue={visit.notes} multiline />
          <Button>Save changes</Button>
        </form>
        <form action={deleteVisit} className="mt-6 border-t border-border pt-5">
          <input type="hidden" name="id" value={visit.id} />
          <Button variant="danger">Delete visit</Button>
        </form>
      </Card>
    </div>
  );
}
