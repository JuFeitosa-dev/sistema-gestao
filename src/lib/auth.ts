import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { Profile } from "./types";

/**
 * Carrega o perfil de quem está logado (organização + papel).
 * Se não houver login, manda para a tela de login.
 */
export async function getCurrentProfile(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, org_id, full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return profile as Profile;
}
