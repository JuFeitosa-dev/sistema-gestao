import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDuration } from "@/lib/format";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-grafite/70">{label}</p>
      <p className="text-2xl font-display text-roxo mt-1">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [activeProjects, myOpenTasks, myEntries] = await Promise.all([
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "ativo"),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("assignee_id", profile.id)
      .neq("status", "feito"),
    supabase
      .from("time_entries")
      .select("duration_seconds")
      .eq("user_id", profile.id)
      .gte("started_at", sevenDaysAgo)
      .not("duration_seconds", "is", null),
  ]);

  const mySeconds = (myEntries.data ?? []).reduce(
    (sum, e) => sum + (e.duration_seconds ?? 0),
    0,
  );

  const firstName = (profile.full_name ?? "").split(" ")[0] || "Olá";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl">Olá, {firstName} 👋</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Projetos ativos"
          value={String(activeProjects.count ?? 0)}
        />
        <StatCard
          label="Minhas tarefas em aberto"
          value={String(myOpenTasks.count ?? 0)}
        />
        <StatCard
          label="Minhas horas (últimos 7 dias)"
          value={formatDuration(mySeconds)}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg mb-3">Atalhos</h2>
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/tarefas"
            className="rounded-lg bg-magenta text-white px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Apontar horas nas tarefas
          </Link>
          <Link
            href="/projetos"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-grafite hover:bg-gray-50"
          >
            Ver projetos
          </Link>
          <Link
            href="/relatorios"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-grafite hover:bg-gray-50"
          >
            Relatórios de horas
          </Link>
        </div>
      </div>
    </div>
  );
}
