import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  canManage,
  PROJECT_STATUS_LABELS,
  type ProjectStatus,
  type TaskStatus,
} from "@/lib/types";
import { formatDuration } from "@/lib/format";
import Badge from "@/components/Badge";
import { type Task, type SubtaskData } from "@/components/TaskItem";
import ProjectTaskList from "@/components/ProjectTaskList";
import NewTaskForm from "@/components/NewTaskForm";
import ProjectActions from "@/components/ProjectActions";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, type, status, closed_value, areas(name), clients(name)")
    .eq("id", id)
    .maybeSingle();

  if (!project) notFound();

  const [{ data: tasks }, { data: members }, { data: activeEntry }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select(
          "id, title, description, status, project_id, due_date, estimate_hours, assignee_id, parent_task_id, profiles(full_name)",
        )
        .eq("project_id", id)
        .order("created_at", { ascending: true }),
      supabase.from("profiles").select("id, full_name").order("full_name"),
      supabase
        .from("time_entries")
        .select("task_id")
        .is("ended_at", null)
        .eq("user_id", profile.id)
        .maybeSingle(),
    ]);

  const taskIds = (tasks ?? []).map((t) => t.id);
  const secondsByTask: Record<string, number> = {};
  if (taskIds.length > 0) {
    const { data: entries } = await supabase
      .from("time_entries")
      .select("task_id, duration_seconds")
      .in("task_id", taskIds);
    for (const e of entries ?? []) {
      if (e.duration_seconds != null) {
        secondsByTask[e.task_id] =
          (secondsByTask[e.task_id] ?? 0) + e.duration_seconds;
      }
    }
  }

  const activeTaskId = activeEntry?.task_id ?? null;
  const area = project.areas as unknown as { name: string } | null;
  const client = project.clients as unknown as { name: string } | null;
  const manage = canManage(profile.role);
  const totalSeconds = Object.values(secondsByTask).reduce((a, b) => a + b, 0);

  // Monta as tarefas em objetos e separa tarefas-mãe de subtarefas.
  type Row = Task & { parent_task_id: string | null };
  const allTasks: Row[] = (tasks ?? []).map((t) => {
    const assignee = t.profiles as unknown as { full_name: string | null } | null;
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status as TaskStatus,
      project_id: t.project_id,
      due_date: t.due_date,
      estimate_hours: t.estimate_hours,
      assigneeName: assignee?.full_name ?? null,
      assignee_id: t.assignee_id,
      parent_task_id: t.parent_task_id as string | null,
    };
  });

  const childrenByParent = new Map<string, Row[]>();
  for (const t of allTasks) {
    if (t.parent_task_id) {
      const list = childrenByParent.get(t.parent_task_id) ?? [];
      list.push(t);
      childrenByParent.set(t.parent_task_id, list);
    }
  }
  const parents = allTasks.filter((t) => !t.parent_task_id);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/projetos"
          className="text-sm text-grafite/70 hover:text-magenta"
        >
          ← Projetos
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl">{project.name}</h1>
            <div className="flex items-center gap-2 flex-wrap mt-2 text-sm text-grafite/80">
              <Badge variant={project.type}>
                {project.type === "cliente" ? "Cliente" : "Interno"}
              </Badge>
              <span>
                {project.type === "cliente"
                  ? (client?.name ?? "Sem cliente")
                  : (area?.name ?? "Sem área")}
              </span>
              <Badge variant={project.status}>
                {PROJECT_STATUS_LABELS[project.status as ProjectStatus]}
              </Badge>
            </div>
          </div>
          <ProjectActions
            projectId={project.id}
            status={project.status as ProjectStatus}
            canManage={manage}
          />
        </div>
        <p className="text-sm text-grafite/70">
          Total de horas no projeto:{" "}
          <span className="font-medium text-roxo">
            {formatDuration(totalSeconds)}
          </span>
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl">Tarefas</h2>
        {manage && <NewTaskForm projectId={project.id} members={members ?? []} />}
      </div>

      {parents.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-grafite/70">
          Nenhuma tarefa ainda.
          {manage && " Clique em “Nova tarefa”."}
        </div>
      ) : (
        <ProjectTaskList
          canManage={manage}
          members={members ?? []}
          items={parents.map((t) => {
            const children = childrenByParent.get(t.id) ?? [];
            const subtasks: SubtaskData[] = children.map((c) => ({
              task: c,
              seconds: secondsByTask[c.id] ?? 0,
              isActive: activeTaskId === c.id,
            }));
            // Tempo da mãe = tempo próprio + soma das subtarefas.
            const childrenSeconds = children.reduce(
              (sum, c) => sum + (secondsByTask[c.id] ?? 0),
              0,
            );
            const rolledUpSeconds = (secondsByTask[t.id] ?? 0) + childrenSeconds;
            return {
              task: t,
              seconds: rolledUpSeconds,
              isActive: activeTaskId === t.id,
              includesSubtasks: children.length > 0,
              subtasks,
            };
          })}
        />
      )}
    </div>
  );
}
