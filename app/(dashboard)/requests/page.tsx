import Link from "next/link";
import { Badge, DataTable, Empty, PageHeader, Tabs } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { REQUEST_STATUS_LABEL, fmtDateTime } from "@/lib/labels";
import type { RequestStatus } from "@/lib/database.types";

const TONE: Record<RequestStatus, "warning" | "success" | "danger"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = (["pending", "approved", "rejected"].includes(status ?? "") ? status : "pending") as RequestStatus;
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("edit_requests")
    .select("*, profiles:requested_by(full_name)")
    .eq("status", filter)
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        eyebrow="Review"
        title="Approvals"
        description="Technicians cannot edit after save. These are the changes waiting on you."
        actions={
          <Tabs
            active={`/requests?status=${filter}`}
            items={[
              { href: "/requests?status=pending", label: "Pending" },
              { href: "/requests?status=approved", label: "Approved" },
              { href: "/requests?status=rejected", label: "Rejected" },
            ]}
          />
        }
      />
      {(data ?? []).length === 0 ? (
        <Empty title={filter === "pending" ? "Inbox clear" : "Nothing here"}>
          {filter === "pending" ? "No edit requests waiting." : "No requests in this status."}
        </Empty>
      ) : (
        <DataTable headers={["What", "Requested by", "When", "Status"]}>
          {(data ?? []).map((r) => (
            <tr key={r.id} className="transition hover:bg-[#faf6ef]">
              <td className="px-5 py-4 font-semibold">
                <Link href={`/requests/${r.id}`} className="hover:text-gold">
                  {r.target_table === "clients" ? "Client" : "Visit"} change
                </Link>
                <div className="text-xs font-normal text-muted">{Object.keys(r.changes).join(", ")}</div>
              </td>
              <td className="px-5 py-4 text-muted">
                {(r.profiles as { full_name: string } | null)?.full_name}
              </td>
              <td className="px-5 py-4 text-muted">{fmtDateTime(r.created_at)}</td>
              <td className="px-5 py-4">
                <Badge tone={TONE[r.status]}>{REQUEST_STATUS_LABEL[r.status]}</Badge>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}
