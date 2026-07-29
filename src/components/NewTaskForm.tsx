"use client";

import { useState } from "react";
import { createTask } from "@/app/(app)/projetos/actions";

type Member = { id: string; full_name: string | null };

export default function NewTaskForm({
  projectId,
  members,
}: {
  projectId: string;
  members: Member[];
}) {
  const [open, setOpen] = useState(false);
  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-magenta focus:outline-none";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-magenta text-white px-4 py-2 text-sm font-medium hover:opacity-90"
      >
        + Nova tarefa
      </button>
    );
  }

  return (
    <form
      action={async (fd) => {
        await createTask(fd);
        setOpen(false);
      }}
      className="bg-white rounded-xl border border-gray-200 p-5 space-y-4"
    >
      <input type="hidden" name="project_id" value={projectId} />
      <h3 className="text-lg">Nova tarefa</h3>

      <div>
        <label className="block text-sm mb-1">Título</label>
        <input name="title" required className={inputClass} autoFocus />
      </div>

      <div>
        <label className="block text-sm mb-1">Descrição (opcional)</label>
        <textarea
          name="description"
          rows={4}
          className={inputClass}
          placeholder="Use Enter para separar em parágrafos. Links (https://...) ficam clicáveis."
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1">Responsável</label>
          <select name="assignee_id" className={inputClass}>
            <option value="">— Ninguém —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name ?? "Sem nome"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Estimativa (h)</label>
          <input
            type="number"
            step="0.5"
            min="0"
            name="estimate_hours"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Prazo</label>
          <input type="date" name="due_date" className={inputClass} />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-magenta text-white px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Salvar tarefa
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-grafite hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
