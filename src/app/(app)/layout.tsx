import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import ActiveTimerBar from "@/components/ActiveTimerBar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: activeRows } = await supabase
    .from("time_entries")
    .select("id, task_id, started_at, tasks(title, projects(name))")
    .is("ended_at", null)
    .eq("user_id", profile.id)
    .order("started_at", { ascending: true });

  // O Supabase devolve as relações aninhadas; normalizamos para o componente.
  const actives = (activeRows ?? []).map((row) => {
    const task = row.tasks as unknown as
      | { title: string; projects: { name: string } | null }
      | null;
    return {
      id: row.id as string,
      taskId: row.task_id as string,
      startedAt: row.started_at as string,
      taskTitle: task?.title ?? "Tarefa",
      projectName: task?.projects?.name ?? "Projeto",
    };
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Nav role={profile.role} userName={profile.full_name ?? "Você"} />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-2.5">
          <ActiveTimerBar actives={actives} />
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
