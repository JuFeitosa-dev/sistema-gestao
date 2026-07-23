"use client";

import { useState } from "react";
import { createClientRecord } from "@/app/(app)/projetos/actions";

export default function NewClientForm() {
  const [open, setOpen] = useState(false);
  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-magenta focus:outline-none";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-magenta hover:underline"
      >
        + Cadastrar cliente
      </button>
    );
  }

  return (
    <form
      action={async (fd) => {
        await createClientRecord(fd);
        setOpen(false);
      }}
      className="bg-white rounded-xl border border-gray-200 p-4 space-y-3"
    >
      <h4 className="text-base">Novo cliente</h4>
      <div>
        <label className="block text-sm mb-1">Nome</label>
        <input name="name" required className={inputClass} autoFocus />
      </div>
      <div>
        <label className="block text-sm mb-1">Contato (opcional)</label>
        <input
          name="contact"
          placeholder="email, telefone..."
          className={inputClass}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-roxo text-white px-3 py-1.5 text-sm hover:opacity-90"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-grafite hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
