import Link from "next/link";
import { DataTable, Empty, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("clients").select("*").order("name");
  const query = (q ?? "").trim().toLowerCase();
  const clients = (data ?? []).filter(
    (c) =>
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.company_id.toLowerCase().includes(query) ||
      (c.contact_name ?? "").toLowerCase().includes(query) ||
      (c.address ?? "").toLowerCase().includes(query),
  );

  return (
    <div>
      <PageHeader
        eyebrow="Sites"
        title="Clients"
        description="Shared locations, contacts, and how to find them."
        actions={
          <form>
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search name or company ID"
              className="w-full rounded-full border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-4 focus:ring-gold/15 sm:w-72"
            />
          </form>
        }
      />
      {clients.length === 0 ? (
        <Empty>No clients match that search.</Empty>
      ) : (
        <DataTable headers={["Client", "Company ID", "Contact", "Location"]}>
          {clients.map((c) => (
            <tr key={c.id} className="transition hover:bg-[#faf6ef]">
              <td className="px-5 py-4 font-semibold">
                <Link href={`/clients/${c.id}`} className="hover:text-gold">
                  {c.name}
                </Link>
                {c.address ? <div className="text-xs font-normal text-muted">{c.address}</div> : null}
              </td>
              <td className="px-5 py-4 text-muted">{c.company_id}</td>
              <td className="px-5 py-4">
                {c.contact_name ?? "—"}
                {c.contact_phone ? <div className="text-xs text-muted">{c.contact_phone}</div> : null}
              </td>
              <td className="px-5 py-4">
                {c.lat != null && c.lng != null ? (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-gold hover:underline"
                  >
                    Navigate
                  </a>
                ) : (
                  <span className="text-muted">No GPS</span>
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}
