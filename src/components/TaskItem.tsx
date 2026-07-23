"use client";

import { useState, useTransition } from "react";
import {
  startTimer,
  stopTimer,
  addManualEntry,
  setTaskStatus,
} from "@/app/(app)/actions";
import { deleteTask } from "@/app/(app)/projetos/actions";
import { formatDuration, formatDate } from "@/lib/format";
import {
  TASK_STATUS_LABELS,
  HOUR_KIND_LABELS,
  type TaskStatus,
  type HourKind,
} from "@/lib/types";
import Badge from "./Badge";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  project_id: string;
  due_date: string | null;
  estimate_hours: number | null;
  assigneeName: string | null;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function TaskItem({
  task,
  seconds,
  isActive,
  canManage,
  projectName,
}: {
  task: Task;
  seconds: number;
  isActive: boolean;
  canManage: boolean;
  projectName?: string;
}) {
  const [pending, startT] = useTransition();
  const [kind, setKind] = useState<HourKind>("projeto");
  const [manualOpen, setManualOpen] = useState(false);

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-magenta focus:outline-none";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base leading-tight">{task.title}</h3>
            <Badge variant={task.status}>{TASK_STATUS_LABELS[task.status]}</Badge>
          </div>
          {projectName && (
            <p className="text-xs text-grafite/60 mt-0.5">{projectName}</p>
          )}
          {task.description && (
            <p className="text-sm text-grafite/80 mt-1">{task.description}</p>
          )}
          <div className="flex items-center gap-3 flex-wrap text-xs text-grafite/70 mt-2">
            {task.assigneeName && <span>👤 {task.assigneeName}</span>}
            {task.due_date && <span>📅 {formatDate(task.due_date)}</span>}
            {task.estimate_hours != null && (
              <span>estimativa: {task.estimate_hours}h</span>
            )}
            <span className="font-medium text-roxo">
              ⏱ {formatDuration(seconds)}
            </span>
          </div>
        </div>

        {canManage && (
          <button
            onClick={() =>
              startT(() => deleteTask(task.id, task.project_id))
            }
            disabled={pending}
            title="Apagar tarefa"
            className="text-grafite/40 hover:text-magenta text-sm shrink-0"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-gray-100">
        {/* Cronômetro */}
        {isActive ? (
          <button
            onClick={() => startT(() => stopTimer())}
            disabled={pending}
            className="rounded-lg bg-roxo text-white px-3 py-1.5 text-sm hover:opacity-90 disabled:opacity-60"
          >
            ⏹ Parar cronômetro
          </button>
        ) : (
          <>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden text-xs">
              {(["projeto", "ao_vivo"] as HourKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`px-2.5 py-1.5 ${
                    kind === k
                      ? "bg-magenta/10 text-magenta font-medium"
                      : "text-grafite"
                  }`}
                >
                  {HOUR_KIND_LABELS[k]}
                </button>
              ))}
            </div>
            <button
              onClick={() => startT(() => startTimer(task.id, kind))}
              disabled={pending}
              className="rounded-lg bg-magenta text-white px-3 py-1.5 text-sm hover:opacity-90 disabled:opacity-60"
            >
              ▶ Iniciar
            </button>
          </>
        )}

        <button
          onClick={() => setManualOpen((v) => !v)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-grafite hover:bg-gray-50"
        >
          Lançar manual
        </button>

        {/* Status */}
        <select
          value={task.status}
          onChange={(e) =>
            startT(() => setTaskStatus(task.id, e.target.value as TaskStatus))
          }
          disabled={pending}
          className="ml-auto rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-grafite"
        >
          {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((s) => (
            <option key={s} value={s}>
              {TASK_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {manualOpen && (
        <form
          action={async (fd) => {
            await addManualEntry(fd);
            setManualOpen(false);
          }}
          className="mt-3 pt-3 border-t border-gray-100 grid gap-3 sm:grid-cols-2"
        >
          <input type="hidden" name="task_id" value={task.id} />
          <div>
            <label className="block text-xs mb-1">Data</label>
            <input
              type="date"
              name="date"
              defaultValue={today()}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Tipo de hora</label>
            <select name="kind" className={inputClass} defaultValue="projeto">
              <option value="projeto">Projeto</option>
              <option value="ao_vivo">Ao vivo</option>
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">Horas</label>
            <input
              type="number"
              name="hours"
              min="0"
              defaultValue="0"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Minutos</label>
            <input
              type="number"
              name="minutes"
              min="0"
              max="59"
              defaultValue="0"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs mb-1">Observação (opcional)</label>
            <input name="note" className={inputClass} />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-magenta text-white px-3 py-1.5 text-sm hover:opacity-90"
            >
              Salvar horas
            </button>
            <button
              type="button"
              onClick={() => setManualOpen(false)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-grafite hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
