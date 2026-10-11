"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function signIn(_prev: { error?: string } | null, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  let supabase;
  try {
    supabase = await createClient();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Server is missing Supabase env keys." };
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return { error: "Could not verify session." };

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (profile?.status === "suspended") {
    await supabase.auth.signOut();
    return { error: "This account is suspended. Ask another admin to restore it." };
  }
  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "This dashboard is for admins only. Sign in from the mobile app as a regular user." };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function reviewRequest(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const approve = String(formData.get("approve") ?? "") === "true";
  const note = String(formData.get("note") ?? "").trim() || null;
  const { error } = await supabase.rpc("review_edit_request", {
    p_request_id: id,
    p_approve: approve,
    p_note: note,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/requests");
  revalidatePath(`/requests/${id}`);
  redirect("/requests");
}

export async function setPendingDone(formData: FormData) {
  const { supabase } = await requireAdmin();
  const visitId = String(formData.get("visit_id") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  const done = String(formData.get("done") ?? "true") === "true";
  const { error } = await supabase.rpc("set_pending_status", {
    p_visit_id: visitId,
    p_done: done,
    p_note: note,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/pending");
  revalidatePath("/visits");
  revalidatePath("/");
}

export async function toggleRole(formData: FormData) {
  const { supabase, profile } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "") === "admin" ? "user" : "admin";
  if (id === profile.id) throw new Error("You cannot change your own role.");
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/team");
}

export async function createUser(_prev: { error?: string } | null, formData: FormData) {
  await requireAdmin();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "user") === "admin" ? "admin" : "user";
  if (!fullName || !email || password.length < 6) {
    return { error: "Name, email, and a password of at least 6 characters are required." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Missing service role key." };
  }
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error || !data.user) return { error: error?.message ?? "Could not create the account." };

  const { error: profileError } = await admin
    .from("profiles")
    .update({ full_name: fullName, email, role, status: "active" })
    .eq("id", data.user.id);
  if (profileError) return { error: profileError.message };

  revalidatePath("/team");
  revalidatePath("/");
  redirect("/team?created=1");
}

export async function setAccountStatus(formData: FormData) {
  const { supabase, profile } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") === "suspended" ? "suspended" : "active";
  if (id === profile.id) throw new Error("You cannot suspend your own account.");

  const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  try {
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(id, {
      ban_duration: status === "suspended" ? "876000h" : "none",
    });
  } catch {
    // Profile status is enough for the apps to block login; ban is extra lockout.
  }

  revalidatePath("/team");
  revalidatePath("/");
}

export async function deleteUser(formData: FormData) {
  const { supabase, profile } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id === profile.id) throw new Error("You cannot delete your own account.");

  const { data: target } = await supabase.from("profiles").select("status, role").eq("id", id).single();
  if (!target) throw new Error("Account not found.");
  if (target.status !== "suspended") {
    throw new Error("Suspend the account first, then delete it.");
  }
  if (target.role === "admin") {
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin")
      .eq("status", "active");
    if ((count ?? 0) < 1) throw new Error("Keep at least one active admin.");
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Missing service role key.");
  }
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) throw new Error(error.message);

  revalidatePath("/team");
  revalidatePath("/");
}

export async function saveWhatsapp(formData: FormData) {
  const { supabase } = await requireAdmin();
  const value = String(formData.get("whatsapp") ?? "").replace(/\D/g, "");
  const { error } = await supabase.from("settings").upsert({
    key: "report_whatsapp_number",
    value,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}

export async function updateClient(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const { error } = await supabase
    .from("clients")
    .update({
      company_id: String(formData.get("company_id") ?? "").trim(),
      name: String(formData.get("name") ?? "").trim(),
      contact_name: String(formData.get("contact_name") ?? "").trim() || null,
      contact_phone: String(formData.get("contact_phone") ?? "").trim() || null,
      address: String(formData.get("address") ?? "").trim() || null,
      directions_note: String(formData.get("directions_note") ?? "").trim() || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
}

export async function deleteClient(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/clients");
  redirect("/clients");
}

export async function updateVisit(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const { error } = await supabase
    .from("visits")
    .update({
      visit_type: String(formData.get("visit_type") ?? "other") as
        | "installation"
        | "follow_up"
        | "issue_fix"
        | "other",
      work_done: String(formData.get("work_done") ?? ""),
      pending: String(formData.get("pending") ?? ""),
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/visits");
  revalidatePath(`/visits/${id}`);
}

export async function deleteVisit(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const { error } = await supabase.from("visits").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/visits");
  redirect("/visits");
}
