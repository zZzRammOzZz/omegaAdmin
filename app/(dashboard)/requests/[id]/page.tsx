import { notFound } from "next/navigation";
import { TextArea } from "@/components/text-input";
import { BackLink, Badge, Button, Card, Empty, PageHeader } from "@/components/ui";
import { reviewRequest } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { FIELD_LABEL, REQUEST_STATUS_LABEL, fmtDateTime } from "@/lib/labels";

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: req } = await supabase
    .from("edit_requests")
    .select("*, profiles:requested_by(full_name)")
    .eq("id", id)
    .single();
  if (!req) notFound();

  const { data: target } = await supabase.from(req.target_table).select("*").eq("id", req.target_id).maybeSingle();
  const current = (target as Record<string, unknown> | null) ?? null;
  const tone = req.status === "pending" ? "warning" : req.status === "approved" ? "success" : "danger";

  return (
    <div className="max-w-2xl">
      <BackLink href="/requests">Approvals</BackLink>
      <PageHeader
        eyebrow={req.target_table === "clients" ? "Client change" : "Visit change"}
        title="Proposed edit"
        description={`${(req.profiles as { full_name: string } | null)?.full_name} · ${fmtDateTime(req.created_at)}${req.reason ? ` · “${req.reason}”` : ""}`}
        actions={<Badge tone={tone}>{REQUEST_STATUS_LABEL[req.status]}</Badge>}
      />

      {!current ? <Empty>The original record no longer exists.</Empty> : null}

      <div className="space-y-3">
        {Object.entries(req.changes).map(([k, v]) => (
          <Card key={k}>
            <div className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
              {FIELD_LABEL[k] ?? k}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-[11px] text-muted">Current</div>
                <div className="mt-1 text-sm text-danger line-through">
                  {current?.[k] == null || current[k] === "" ? "—" : String(current[k])}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-muted">Requested</div>
                <div className="mt-1 text-sm text-success">{v == null || v === "" ? "—" : String(v)}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {req.status === "pending" && current ? (
        <form action={reviewRequest} className="panel mt-6 p-6">
          <input type="hidden" name="id" value={req.id} />
          <label className="mb-4 block text-xs font-semibold tracking-wide text-muted uppercase">
            Note to the requester
            <TextArea
              name="note"
              placeholder="Optional"
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm font-normal normal-case text-foreground outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              name="approve"
              value="true"
              className="inline-flex items-center rounded-full bg-success px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Approve & apply
            </button>
            <button
              type="submit"
              name="approve"
              value="false"
              className="inline-flex items-center rounded-full bg-danger px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Reject
            </button>
          </div>
        </form>
      ) : req.review_note ? (
        <p className="mt-6 text-sm text-muted">Review note: {req.review_note}</p>
      ) : null}

      <div className="mt-6">
        <Button href={req.target_table === "visits" ? `/visits/${req.target_id}` : `/clients/${req.target_id}`} variant="secondary">
          {req.target_table === "visits" ? "Open visit" : "Open client"}
        </Button>
      </div>
    </div>
  );
}
