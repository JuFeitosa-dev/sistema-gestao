"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

/** Muda o papel de um membro da equipe. Só o admin consegue (garantido também pelo banco). */
export async function setMemberRole(userId: string, role: Role) {
  const profile = await getCurrentProfile();
  if (profile.role !== "admin") return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/equipe");
}
