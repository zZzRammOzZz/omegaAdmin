import { Sidebar } from "@/components/sidebar";
import { requireAdmin } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile } = await requireAdmin();
  const { count } = await supabase
    .from("pending_items")
    .select("*", { count: "exact", head: true })
    .eq("pending_status", "open");

  return (
    <div className="flex min-h-dvh flex-col bg-dark lg:flex-row">
      <Sidebar profile={profile} pendingCount={count ?? 0} />
      <main className="canvas min-w-0 flex-1 overflow-auto bg-background p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-6 lg:rounded-l-[28px] lg:p-12">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
