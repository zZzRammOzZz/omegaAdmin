import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink, Badge, Button, Card, Empty, Field, PageHeader } from "@/components/ui";
import { deleteClient, updateClient } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { VISIT_TYPE_LABEL, fmtDateTime } from "@/lib/labels";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data: client }, { data: visits }, { data: pending }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase
      .from("visits")
      .select("*, profiles:user_id(full_name)")
      .eq("client_id", id)
      .order("visited_at", { ascending: false }),
    supabase.from("pending_items").select("*").eq("client_id", id).eq("pending_status", "open"),
  ]);
  if (!client) notFound();

  return (
    <div className="max-w-3xl">
      <BackLink href="/clients">Clients</BackLink>
      <PageHeader
        eyebrow="Site"
        title={client.name}
        description={client.address ?? "No address on file"}
        actions={<Badge tone="gold">{client.company_id}</Badge>}
      />

      {(pending ?? []).length > 0 ? (
        <Card className="mb-6 border-l-4 border-l-warning">
          <h2 className="serif text-2xl">Open pending</h2>
          <ul className="mt-4 space-y-3">
            {(pending ?? []).map((p) => (
              <li key={p.visit_id} className="text-sm leading-6">
                {p.pending}
                <span className="text-muted">
                  {" "}
                  · {p.reported_by_name} ·{" "}
                  <Link href={`/visits/${p.visit_id}`} className="font-semibold text-gold hover:underline">
                    visit
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card className="mb-8">
        <h2 className="serif mb-5 text-2xl">Site details</h2>
        <form action={updateClient}>
          <input type="hidden" name="id" value={client.id} />
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Field label="Company ID" name="company_id" defaultValue={client.company_id} required />
            <Field label="Name" name="name" defaultValue={client.name} required />
            <Field label="Contact person" name="contact_name" defaultValue={client.contact_name} />
            <Field label="Contact phone" name="contact_phone" defaultValue={client.contact_phone} />
          </div>
          <Field label="Address" name="address" defaultValue={client.address} />
          <Field label="How to find it" name="directions_note" defaultValue={client.directions_note} multiline />
          <div className="flex flex-wrap gap-2">
            <Button>Save changes</Button>
            {client.lat != null && client.lng != null ? (
              <Button
                href={`https://www.google.com/maps/dir/?api=1&destination=${client.lat},${client.lng}`}
                variant="secondary"
              >
                Navigate
              </Button>
            ) : null}
          </div>
        </form>
        <form action={deleteClient} className="mt-6 border-t border-border pt-5">
          <input type="hidden" name="id" value={client.id} />
          <Button variant="danger">Delete client</Button>
        </form>
      </Card>

      <h2 className="serif mb-4 text-2xl">Visit history</h2>
      {(visits ?? []).length === 0 ? (
        <Empty>No visits recorded at this site.</Empty>
      ) : (
        <ul className="space-y-3">
          {(visits ?? []).map((v) => (
            <li key={v.id}>
              <Link href={`/visits/${v.id}`} className="block">
                <Card className="transition hover:border-gold/40">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold">{VISIT_TYPE_LABEL[v.visit_type]}</div>
                      <div className="mt-0.5 text-xs text-muted">
                        {(v.profiles as { full_name: string } | null)?.full_name}
                      </div>
                    </div>
                    <div className="text-xs text-muted">{fmtDateTime(v.visited_at)}</div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6">{v.work_done}</p>
                  {v.pending_status === "open" ? (
                    <p className="mt-2 text-xs text-warning">Pending: {v.pending}</p>
                  ) : null}
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
