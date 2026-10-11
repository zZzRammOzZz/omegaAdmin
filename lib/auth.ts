import { redirect } from "next/navigation";
import type { Profile } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  profile: Profile;
}> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (!profile || profile.role !== "admin") {
    await supabase.auth.signOut();
    redirect("/login?error=admin");
  }
  if (profile.status === "suspended") {
    await supabase.auth.signOut();
    redirect("/login?error=suspended");
  }

  return { supabase, profile };
}
