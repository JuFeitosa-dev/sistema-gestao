// Tipos e rótulos usados em todo o sistema.

export type Role = "admin" | "gestor" | "colaborador";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  gestor: "Gestor",
  colaborador: "Colaborador",
};

export type ProjectStatus = "ativo" | "pausado" | "concluido";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  ativo: "Ativo",
  pausado: "Pausado",
  concluido: "Concluído",
};

export type TaskStatus = "a_fazer" | "fazendo" | "feito";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  a_fazer: "A fazer",
  fazendo: "Fazendo",
  feito: "Feito",
};

export type HourKind = "projeto" | "ao_vivo";

export const HOUR_KIND_LABELS: Record<HourKind, string> = {
  projeto: "Projeto",
  ao_vivo: "Ao vivo",
};

export type Profile = {
  id: string;
  org_id: string;
  full_name: string | null;
  role: Role;
};

export function canManage(role: Role): boolean {
  return role === "admin" || role === "gestor";
}
