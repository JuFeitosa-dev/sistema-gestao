import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { canManage, PROJECT_STATUS_LABELS } from "@/lib/types";
import { formatDuration } from "@/lib/format";
import Badge from "@/components/Badge";
import NewProjectForm from "@/components/NewProjectForm";
import NewClientForm from "@/components/NewClientForm";

export default async function ProjetosPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [{ data: projects }, { data: areas }, { data: clients }, { data: entries }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id, name, type, status, areas(name), clients(name)")
        .order("created_at", { ascending: false }),
      supabase.from("areas").select("id, name").order("name"),
      supabase.from("clients").select("id, name").order("name"),
      supabase
        .from("time_entries")
        .select("duration_seconds, tasks(project_id)")
        .not("duration_seconds", "is", null),
    ]);

  const hoursByProject: Record<string, number> = {};
  for (const e of entries ?? []) {
    const pid = (e.tasks as unknown as { project_id: string } | null)?.project_id;
    if (pid) {
      hoursByProject[pid] =
        (hoursByProject[pid] ?? 0) + (e.duration_seconds ?? 0);
    }
  }

  const manage = canManage(profile.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl">Projetos</h1>
        {manage && (
          <NewProjectForm
            areas={areas ?? []}
            clients={clients ?? []}
            isAdmin={profile.role === "admin"}
          />
        )}
      </div>

      {(projects?.length ?? 0) === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-grafite/70">
          Nenhum projeto ainda.
          {manage && " Clique em “Novo projeto” para começar."}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects?.map((p) => {
            const area = p.areas as unknown as { name: string } | null;
            const client = p.clients as unknown as { name: string } | null;
            return (
              <Link
                key={p.id}
                href={`/projetos/${p.id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-magenta hover:shadow-sm transition block"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="text-lg leading-tight">{p.name}</h2>
                  <Badge variant={p.status}>
                    {PROJECT_STATUS_LABELS[
                      p.status as keyof typeof PROJECT_STATUS_LABELS
                    ] ?? p.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-sm text-grafite/80">
                  <Badge variant={p.type}>
                    {p.type === "cliente" ? "Cliente" : "Interno"}
                  </Badge>
                  <span>
                    {p.type === "cliente"
                      ? (client?.name ?? "Sem cliente")
                      : (area?.name ?? "Sem área")}
                  </span>
                </div>
                <p className="text-sm text-grafite/70 mt-3">
                  Horas registradas:{" "}
                  <span className="font-medium text-roxo">
                    {formatDuration(hoursByProject[p.id] ?? 0)}
                  </span>
                </p>
              </Link>
            );
          })}
        </div>
      )}

      {manage && (
        <div className="pt-2">
          <NewClientForm />
        </div>
      )}
    </div>
  );
}
