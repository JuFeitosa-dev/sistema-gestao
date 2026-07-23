"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { HourKind, TaskStatus } from "@/lib/types";

/** Sai da conta (logout). */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/** Inicia o cronômetro numa tarefa. Para automaticamente qualquer outro ativo. */
export async function startTimer(taskId: string, kind: HourKind) {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  // Garante "um cronômetro ativo por vez": encerra o que estiver aberto.
  await supabase
    .from("time_entries")
    .update({ ended_at: new Date().toISOString() })
    .is("ended_at", null)
    .eq("user_id", profile.id);

  await supabase.from("time_entries").insert({
    org_id: profile.org_id,
    user_id: profile.id,
    task_id: taskId,
    kind,
  });

  revalidatePath("/", "layout");
}

/** Para o cronômetro ativo do usuário. */
export async function stopTimer() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  await supabase
    .from("time_entries")
    .update({ ended_at: new Date().toISOString() })
    .is("ended_at", null)
    .eq("user_id", profile.id);

  revalidatePath("/", "layout");
}

/** Lançamento manual de horas (para quem esqueceu de ligar o cronômetro). */
export async function addManualEntry(formData: FormData) {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const taskId = String(formData.get("task_id") ?? "");
  const dateStr = String(formData.get("date") ?? "");
  const hours = Number(formData.get("hours") ?? 0);
  const minutes = Number(formData.get("minutes") ?? 0);
  const kind = (String(formData.get("kind") ?? "projeto") as HourKind);
  const note = String(formData.get("note") ?? "").trim() || null;

  const durationSec = Math.floor(hours) * 3600 + Math.floor(minutes) * 60;
  if (!taskId || !dateStr || durationSec <= 0) {
    return; // dados insuficientes; o formulário exige os campos
  }

  const start = new Date(`${dateStr}T12:00:00`);
  const end = new Date(start.getTime() + durationSec * 1000);

  await supabase.from("time_entries").insert({
    org_id: profile.org_id,
    user_id: profile.id,
    task_id: taskId,
    started_at: start.toISOString(),
    ended_at: end.toISOString(),
    kind,
    note,
  });

  revalidatePath("/", "layout");
}

/** Apaga um apontamento de hora. */
export async function deleteTimeEntry(id: string) {
  const supabase = await createClient();
  await supabase.from("time_entries").delete().eq("id", id);
  revalidatePath("/", "layout");
}

/** Muda o status de uma tarefa (a fazer / fazendo / feito). */
export async function setTaskStatus(taskId: string, status: TaskStatus) {
  const supabase = await createClient();
  await supabase.from("tasks").update({ status }).eq("id", taskId);
  revalidatePath("/", "layout");
}
