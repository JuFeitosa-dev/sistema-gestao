"use client";

import { useState } from "react";
import { createProject } from "@/app/(app)/projetos/actions";

type Option = { id: string; name: string };

export default function NewProjectForm({
  areas,
  clients,
  isAdmin,
}: {
  areas: Option[];
  clients: Option[];
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"interno" | "cliente">("interno");

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-magenta focus:outline-none";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-magenta text-white px-4 py-2 text-sm font-medium hover:opacity-90"
      >
        + Novo projeto
      </button>
    );
  }

  return (
    <form
      action={async (fd) => {
        await createProject(fd);
        setOpen(false);
      }}
      className="bg-white rounded-xl border border-gray-200 p-5 space-y-4"
    >
      <h3 className="text-lg">Novo projeto</h3>

      <div>
        <label className="block text-sm mb-1">Nome do projeto</label>
        <input name="name" required className={inputClass} autoFocus />
      </div>

      <div>
        <label className="block text-sm mb-1">Tipo</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType("interno")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
              type === "interno"
                ? "border-magenta bg-magenta/5 text-roxo font-medium"
                : "border-gray-300 text-grafite"
            }`}
          >
            Interno (área)
          </button>
          <button
            type="button"
            onClick={() => setType("cliente")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
              type === "cliente"
                ? "border-magenta bg-magenta/5 text-roxo font-medium"
                : "border-gray-300 text-grafite"
            }`}
          >
            De cliente
          </button>
        </div>
        <input type="hidden" name="type" value={type} />
      </div>

      {type === "interno" ? (
        <div>
          <label className="block text-sm mb-1">Área</label>
          <select name="area_id" className={inputClass}>
            <option value="">— Selecione —</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="block text-sm mb-1">Cliente</label>
          <select name="client_id" className={inputClass}>
            <option value="">— Selecione —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {clients.length === 0 && (
            <p className="text-xs text-grafite/70 mt-1">
              Nenhum cliente cadastrado ainda. Cadastre um cliente abaixo primeiro.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Início (opcional)</label>
          <input type="date" name="start_date" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm mb-1">Fim (opcional)</label>
          <input type="date" name="end_date" className={inputClass} />
        </div>
      </div>

      {isAdmin && (
        <div>
          <label className="block text-sm mb-1">
            Valor fechado (opcional, usado na Fase 2)
          </label>
          <input
            type="number"
            step="0.01"
            name="closed_value"
            placeholder="R$"
            className={inputClass}
          />
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="rounded-lg bg-magenta text-white px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Salvar projeto
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
