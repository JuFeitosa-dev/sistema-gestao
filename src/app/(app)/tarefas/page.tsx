import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { canManage, type TaskStatus } from "@/lib/types";
import TaskItem from "@/components/TaskItem";

export default async function TarefasPage({
  searchParams,
}: {
  searchParams: Promise<{ pessoa?: string; projeto?: string }>;
}) {
  const { pessoa, projeto } = await searchParams;
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [{ data: projects }, { data: members }, { data: activeEntry }] =
    await Promise.all([
      supabase.from("projects").select("id, name").order("name"),
      supabase.from("profiles").select("id, full_name").order("full_name"),
      supabase
        .from("time_entries")
        .select("task_id")
        .is("ended_at", null)
        .eq("user_id", profile.id)
        .maybeSingle(),
    ]);

  let query = supabase
    .from("tasks")
    .select(
      "id, title, description, status, project_id, due_date, estimate_hours, assignee_id, projects(name), profiles(full_name)",
    )
    .order("created_at", { ascending: false });

  if (projeto) query = query.eq("project_id", projeto);
  if (pessoa) query = query.eq("assignee_id", pessoa);

  const { data: tasks } = await query;

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
  const manage = canManage(profile.role);

  const selectClass =
    "rounded-lg border border-gray-300 px-3 py-2 text-sm text-grafite focus:border-magenta focus:outline-none";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl">Tarefas</h1>

      <form className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3 flex-wrap items-end">
        <div>
          <label className="block text-xs mb-1">Projeto</label>
          <select name="projeto" defaultValue={projeto ?? ""} className={selectClass}>
            <option value="">Todos</option>
            {projects?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Pessoa</label>
          <select name="pessoa" defaultValue={pessoa ?? ""} className={selectClass}>
            <option value="">Todas</option>
            {members?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name ?? "Sem nome"}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-roxo text-white px-4 py-2 text-sm hover:opacity-90"
        >
          Filtrar
        </button>
      </form>

      {(tasks?.length ?? 0) === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-grafite/70">
          Nenhuma tarefa encontrada. Crie tarefas dentro de um projeto.
        </div>
      ) : (
        <div className="space-y-3">
          {tasks?.map((t) => {
            const proj = t.projects as unknown as { name: string } | null;
            const assignee = t.profiles as unknown as { full_name: string | null } | null;
            return (
              <TaskItem
                key={t.id}
                task={{
                  id: t.id,
                  title: t.title,
                  description: t.description,
                  status: t.status as TaskStatus,
                  project_id: t.project_id,
                  due_date: t.due_date,
                  estimate_hours: t.estimate_hours,
                  assigneeName: assignee?.full_name ?? null,
                }}
                seconds={secondsByTask[t.id] ?? 0}
                isActive={activeTaskId === t.id}
                canManage={manage}
                projectName={proj?.name}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
