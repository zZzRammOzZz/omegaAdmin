import Link from "next/link";
import { Badge, DataTable, Empty, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { VISIT_TYPE_LABEL, fmtDateTime } from "@/lib/labels";

export default async function VisitsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("visits")
    .select("*, clients:client_id(name, company_id), profiles:user_id(full_name)")
    .order("visited_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <PageHeader
        eyebrow="Field reports"
        title="Visits"
        description="Every visit the team has logged. Open a row to edit or close pending work."
      />
      {(data ?? []).length === 0 ? (
        <Empty>No visits yet.</Empty>
      ) : (
        <DataTable headers={["Client", "Type", "Technician", "When", "Pending"]}>
          {(data ?? []).map((v) => (
            <tr key={v.id} className="transition hover:bg-[#faf6ef]">
              <td className="px-5 py-4 font-semibold">
                <Link href={`/visits/${v.id}`} className="hover:text-gold">
                  {(v.clients as { name: string } | null)?.name ?? "Unknown"}
                </Link>
              </td>
              <td className="px-5 py-4 text-muted">{VISIT_TYPE_LABEL[v.visit_type]}</td>
              <td className="px-5 py-4 text-muted">
                {(v.profiles as { full_name: string } | null)?.full_name}
              </td>
              <td className="px-5 py-4 text-muted">{fmtDateTime(v.visited_at)}</td>
              <td className="px-5 py-4">
                {v.pending_status === "open" ? <Badge tone="warning">Open</Badge> : null}
                {v.pending_status === "done" ? <Badge tone="success">Done</Badge> : null}
                {v.pending_status === "none" ? <span className="text-muted">—</span> : null}
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}
