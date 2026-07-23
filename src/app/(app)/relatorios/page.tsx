import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDuration, toDecimalHours } from "@/lib/format";

type Row = { name: string; seconds: number };

function TableCard({ title, rows }: { title: string; rows: Row[] }) {
  const sorted = [...rows].sort((a, b) => b.seconds - a.seconds);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <h2 className="text-lg px-5 py-3 border-b border-gray-100">{title}</h2>
      {sorted.length === 0 ? (
        <p className="px-5 py-6 text-sm text-grafite/70">Nenhum registro no período.</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {sorted.map((r) => (
              <tr key={r.name} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-2.5">{r.name}</td>
                <td className="px-5 py-2.5 text-right font-medium text-roxo whitespace-nowrap">
                  {formatDuration(r.seconds)}
                  <span className="text-grafite/50 font-normal">
                    {" "}
                    ({toDecimalHours(r.seconds)}h)
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string; ate?: string }>;
}) {
  const { de, ate } = await searchParams;
  await getCurrentProfile();
  const supabase = await createClient();

  let query = supabase
    .from("time_entries")
    .select(
      "duration_seconds, started_at, tasks(projects(name)), profiles(full_name)",
    )
    .not("duration_seconds", "is", null);

  if (de) query = query.gte("started_at", de);
  if (ate) query = query.lte("started_at", `${ate}T23:59:59`);

  const { data: entries } = await query;

  const byProject: Record<string, number> = {};
  const byPerson: Record<string, number> = {};
  let total = 0;

  for (const e of entries ?? []) {
    const secs = e.duration_seconds ?? 0;
    total += secs;

    const task = e.tasks as unknown as { projects: { name: string } | null } | null;
    const projectName = task?.projects?.name ?? "Sem projeto";
    byProject[projectName] = (byProject[projectName] ?? 0) + secs;

    const person = e.profiles as unknown as { full_name: string | null } | null;
    const personName = person?.full_name ?? "Sem nome";
    byPerson[personName] = (byPerson[personName] ?? 0) + secs;
  }

  const toRows = (map: Record<string, number>): Row[] =>
    Object.entries(map).map(([name, seconds]) => ({ name, seconds }));

  const inputClass =
    "rounded-lg border border-gray-300 px-3 py-2 text-sm text-grafite focus:border-magenta focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl">Relatórios</h1>
        <div className="text-sm text-grafite/70">
          Total no período:{" "}
          <span className="font-medium text-roxo">{formatDuration(total)}</span>{" "}
          ({toDecimalHours(total)}h)
        </div>
      </div>

      <form className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3 flex-wrap items-end">
        <div>
          <label className="block text-xs mb-1">De</label>
          <input type="date" name="de" defaultValue={de ?? ""} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs mb-1">Até</label>
          <input type="date" name="ate" defaultValue={ate ?? ""} className={inputClass} />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-roxo text-white px-4 py-2 text-sm hover:opacity-90"
        >
          Filtrar período
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        <TableCard title="Horas por projeto" rows={toRows(byProject)} />
        <TableCard title="Horas por pessoa" rows={toRows(byPerson)} />
      </div>
    </div>
  );
}
