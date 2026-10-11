import { Button, Card, Field, PageHeader } from "@/components/ui";
import { saveWhatsapp } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "report_whatsapp_number")
    .maybeSingle();

  return (
    <div className="max-w-xl">
      <PageHeader
        eyebrow="Operations"
        title="Settings"
        description="The number technicians open when they share a visit report."
      />
      <Card>
        <p className="serif text-2xl">Boss WhatsApp</p>
        <p className="mt-1 mb-6 text-sm leading-6 text-muted">
          International digits only. Used by the mobile app when someone sends a report.
        </p>
        <form action={saveWhatsapp}>
          <Field
            label="WhatsApp number"
            name="whatsapp"
            defaultValue={data?.value ?? ""}
            placeholder="9715xxxxxxxx"
          />
          <Button>Save number</Button>
        </form>
      </Card>
    </div>
  );
}
