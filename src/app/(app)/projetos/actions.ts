"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/** Cria um projeto (interno ou de cliente). */
export async function createProject(formData: FormData) {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "interno");
  const areaId = String(formData.get("area_id") ?? "") || null;
  const clientId = String(formData.get("client_id") ?? "") || null;
  const startDate = String(formData.get("start_date") ?? "") || null;
  const endDate = String(formData.get("end_date") ?? "") || null;
  const closedValueRaw = String(formData.get("closed_value") ?? "").trim();

  if (!name) return;

  await supabase.from("projects").insert({
    org_id: profile.org_id,
    name,
    type: type === "cliente" ? "cliente" : "interno",
    area_id: type === "interno" ? areaId : null,
    client_id: type === "cliente" ? clientId : null,
    closed_value:
      profile.role === "admin" && closedValueRaw
        ? Number(closedValueRaw)
        : null,
    start_date: startDate,
    end_date: endDate,
  });

  revalidatePath("/projetos");
}

/** Muda o status de um projeto (ativo / pausado / concluído). */
export async function updateProjectStatus(projectId: string, status: string) {
  const supabase = await createClient();
  await supabase.from("projects").update({ status }).eq("id", projectId);
  revalidatePath("/projetos");
  revalidatePath(`/projetos/${projectId}`);
}

/** Apaga um projeto (e suas tarefas/apontamentos em cascata). */
export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  await supabase.from("projects").delete().eq("id", projectId);
  revalidatePath("/projetos");
  redirect("/projetos");
}

/** Cadastra um cliente rapidamente. */
export async function createClientRecord(formData: FormData) {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim() || null;
  if (!name) return;

  await supabase.from("clients").insert({
    org_id: profile.org_id,
    name,
    contact,
  });

  revalidatePath("/projetos");
}

/** Cria uma tarefa (ou subtarefa) dentro de um projeto. */
export async function createTask(formData: FormData) {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const projectId = String(formData.get("project_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const assigneeId = String(formData.get("assignee_id") ?? "") || null;
  const estimateRaw = String(formData.get("estimate_hours") ?? "").trim();
  const dueDate = String(formData.get("due_date") ?? "") || null;
  const parentTaskId = String(formData.get("parent_task_id") ?? "") || null;

  if (!projectId || !title) return;

  await supabase.from("tasks").insert({
    org_id: profile.org_id,
    project_id: projectId,
    title,
    description,
    assignee_id: assigneeId,
    estimate_hours: estimateRaw ? Number(estimateRaw) : null,
    due_date: dueDate,
    parent_task_id: parentTaskId,
  });

  revalidatePath(`/projetos/${projectId}`);
  revalidatePath("/tarefas");
}

/** Edita os dados de uma tarefa existente. */
export async function updateTask(formData: FormData) {
  const supabase = await createClient();

  const taskId = String(formData.get("task_id") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const assigneeId = String(formData.get("assignee_id") ?? "") || null;
  const estimateRaw = String(formData.get("estimate_hours") ?? "").trim();
  const dueDate = String(formData.get("due_date") ?? "") || null;

  if (!taskId || !title) return;

  await supabase
    .from("tasks")
    .update({
      title,
      description,
      assignee_id: assigneeId,
      estimate_hours: estimateRaw ? Number(estimateRaw) : null,
      due_date: dueDate,
    })
    .eq("id", taskId);

  if (projectId) revalidatePath(`/projetos/${projectId}`);
  revalidatePath("/tarefas");
}

/** Apaga uma tarefa. */
export async function deleteTask(taskId: string, projectId: string) {
  const supabase = await createClient();
  await supabase.from("tasks").delete().eq("id", taskId);
  revalidatePath(`/projetos/${projectId}`);
  revalidatePath("/tarefas");
}
