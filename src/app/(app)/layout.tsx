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

  const { data: activeRow } = await supabase
    .from("time_entries")
    .select("id, started_at, tasks(title, projects(name))")
    .is("ended_at", null)
    .eq("user_id", profile.id)
    .maybeSingle();

  // O Supabase devolve as relações aninhadas; normalizamos para o componente.
  const task = activeRow?.tasks as unknown as
    | { title: string; projects: { name: string } | null }
    | null
    | undefined;

  const active = activeRow
    ? {
        id: activeRow.id as string,
        startedAt: activeRow.started_at as string,
        taskTitle: task?.title ?? "Tarefa",
        projectName: task?.projects?.name ?? "Projeto",
      }
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Nav role={profile.role} userName={profile.full_name ?? "Você"} />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-2.5">
          <ActiveTimerBar active={active} />
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
