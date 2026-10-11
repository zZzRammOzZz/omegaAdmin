import { Badge, Card, DataTable, Empty, PageHeader } from "@/components/ui";
import { CreateUserForm, TeamMemberActions } from "@/components/team-forms";
import { requireAdmin } from "@/lib/auth";
import { fmtDate } from "@/lib/labels";
import { hasServiceRole } from "@/lib/supabase/admin";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const { created } = await searchParams;
  const { supabase, profile } = await requireAdmin();
  const { data } = await supabase.from("profiles").select("*").order("full_name");
  const people = data ?? [];
  const canManageAuth = hasServiceRole();

  return (
    <div>
      <PageHeader
        eyebrow="People"
        title="Team"
        description="Create technician accounts here. Suspend first, then delete. They cannot sign up from the phone."
      />

      <Card className="mb-8">
        <h2 className="serif text-2xl">New account</h2>
        <p className="mt-1 mb-5 text-sm leading-6 text-muted">
          Give them the email and temporary password. They sign in on the mobile app only.
        </p>
        {canManageAuth ? (
          <CreateUserForm />
        ) : (
          <p className="text-sm text-danger">
            Add <code className="rounded bg-[#f3eee4] px-1">SUPABASE_SERVICE_ROLE_KEY</code> to{" "}
            <code className="rounded bg-[#f3eee4] px-1">admin/.env.local</code> (Supabase → API Keys → service_role),
            then restart the dashboard.
          </p>
        )}
        {created ? (
          <p className="mt-4 text-sm text-success">Account created. Share the email and password with them.</p>
        ) : null}
      </Card>

      {people.length === 0 ? (
        <Empty>No profiles yet.</Empty>
      ) : (
        <DataTable headers={["Name", "Email", "Role", "Status", "Joined", ""]}>
          {people.map((u) => (
            <tr key={u.id} className="transition hover:bg-[#faf6ef]">
              <td className="px-5 py-4 font-semibold">{u.full_name || "(no name)"}</td>
              <td className="px-5 py-4 text-muted">{u.email ?? "—"}</td>
              <td className="px-5 py-4">
                <Badge tone={u.role === "admin" ? "gold" : "muted"}>{u.role}</Badge>
              </td>
              <td className="px-5 py-4">
                <Badge tone={u.status === "suspended" ? "danger" : "success"}>
                  {u.status === "suspended" ? "Suspended" : "Active"}
                </Badge>
              </td>
              <td className="px-5 py-4 text-muted">{fmtDate(u.created_at)}</td>
              <td className="px-5 py-4 text-right">
                <TeamMemberActions id={u.id} role={u.role} status={u.status} isSelf={u.id === profile.id} />
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}
