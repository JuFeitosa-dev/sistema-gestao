"use client";

import { useTransition } from "react";
import {
  updateProjectStatus,
  deleteProject,
} from "@/app/(app)/projetos/actions";
import { PROJECT_STATUS_LABELS, type ProjectStatus } from "@/lib/types";

export default function ProjectActions({
  projectId,
  status,
  canManage,
}: {
  projectId: string;
  status: ProjectStatus;
  canManage: boolean;
}) {
  const [pending, startT] = useTransition();

  if (!canManage) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={status}
        onChange={(e) =>
          startT(() => updateProjectStatus(projectId, e.target.value))
        }
        disabled={pending}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-grafite"
      >
        {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((s) => (
          <option key={s} value={s}>
            {PROJECT_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <button
        onClick={() => {
          if (confirm("Apagar este projeto e todas as suas tarefas?")) {
            startT(() => deleteProject(projectId));
          }
        }}
        disabled={pending}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-grafite hover:text-magenta hover:border-magenta"
      >
        Apagar projeto
      </button>
    </div>
  );
}
