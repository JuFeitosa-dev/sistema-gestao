// Funções para formatar tempo e datas de forma legível em português.

/** Converte segundos em "2h 15min" (ou "45min", ou "0min"). */
export function formatDuration(seconds: number | null | undefined): string {
  const s = Math.max(0, Math.floor(seconds ?? 0));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}min`;
}

/** Converte segundos em horas decimais (ex.: 1.5) para relatórios. */
export function toDecimalHours(seconds: number | null | undefined): number {
  return Math.round(((seconds ?? 0) / 3600) * 100) / 100;
}

/** Cronômetro ao vivo no formato 00:00:00. */
export function formatStopwatch(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

/** Data legível: "23/07/2026". */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("pt-BR");
}

/** Data e hora: "23/07/2026 14:30". */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
