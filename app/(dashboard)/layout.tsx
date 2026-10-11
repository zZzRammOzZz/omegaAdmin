import { Sidebar } from "@/components/sidebar";
import { requireAdmin } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile } = await requireAdmin();
  const { count } = await supabase
    .from("pending_items")
    .select("*", { count: "exact", head: true })
    .eq("pending_status", "open");

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar profile={profile} pendingCount={count ?? 0} />
      <main className="canvas min-w-0 flex-1 overflow-auto rounded-l-[28px] bg-background p-8 lg:p-12">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
