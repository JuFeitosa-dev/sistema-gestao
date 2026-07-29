"use client";

import { useState, useTransition } from "react";
import {
  startTimer,
  stopTimer,
  addManualEntry,
  setTaskStatus,
} from "@/app/(app)/actions";
import {
  deleteTask,
  createTask,
  updateTask,
} from "@/app/(app)/projetos/actions";
import { formatDuration, formatDate } from "@/lib/format";
import {
  TASK_STATUS_LABELS,
  HOUR_KIND_LABELS,
  type TaskStatus,
  type HourKind,
  type Member,
} from "@/lib/types";
import Badge from "./Badge";
import RichText from "./RichText";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  project_id: string;
  due_date: string | null;
  estimate_hours: number | null;
  assigneeName: string | null;
  assignee_id: string | null;
};

export type SubtaskData = {
  task: Task;
  seconds: number;
  isActive: boolean;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-magenta focus:outline-none";

export default function TaskItem({
  task,
  seconds,
  isActive,
  canManage,
  members,
  projectName,
  subtasks,
  isSubtask = false,
  includesSubtasks = false,
  collapsed = false,
  onToggleCollapse,
}: {
  task: Task;
  seconds: number;
  isActive: boolean;
  canManage: boolean;
  members: Member[];
  projectName?: string;
  subtasks?: SubtaskData[];
  isSubtask?: boolean;
  includesSubtasks?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const [pending, startT] = useTransition();
  const [kind, setKind] = useState<HourKind>("projeto");
  const [manualOpen, setManualOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [subtaskOpen, setSubtaskOpen] = useState(false);

  const hasSubtasks = !!subtasks && subtasks.length > 0;
  const canCollapse = hasSubtasks && !!onToggleCollapse;
  const subtasksVisible = !canCollapse || !collapsed;

  function handleDelete() {
    const message = hasSubtasks
      ? "Excluir esta tarefa? As subtarefas dentro dela também serão excluídas."
      : "Excluir esta tarefa?";
    if (confirm(message)) {
      startT(() => deleteTask(task.id, task.project_id));
    }
  }

  return (
    <div
      className={
        isSubtask
          ? "bg-white rounded-lg border border-gray-200 p-3"
          : "bg-white rounded-xl border border-gray-200 p-4"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {isSubtask && <span className="text-grafite/40">↳</span>}
            <h3 className="text-base leading-tight">{task.title}</h3>
            <Badge variant={task.status}>{TASK_STATUS_LABELS[task.status]}</Badge>
          </div>
          {projectName && (
            <p className="text-xs text-grafite/60 mt-0.5">{projectName}</p>
          )}
          {task.description && (
            <RichText
              text={task.description}
              className="text-sm text-grafite/80 mt-1"
            />
          )}
          <div className="flex items-center gap-3 flex-wrap text-xs text-grafite/70 mt-2">
            {task.assigneeName && <span>👤 {task.assigneeName}</span>}
            {task.due_date && <span>📅 {formatDate(task.due_date)}</span>}
            {task.estimate_hours != null && (
              <span>estimativa: {task.estimate_hours}h</span>
            )}
            <span className="font-medium text-roxo">
              ⏱ {formatDuration(seconds)}
              {includesSubtasks && (
                <span className="text-grafite/50 font-normal">
                  {" "}
                  (inclui subtarefas)
                </span>
              )}
            </span>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setEditOpen((v) => !v)}
              className="text-xs text-grafite/60 hover:text-roxo"
            >
              Editar
            </button>
            <button
              onClick={handleDelete}
              disabled={pending}
              className="text-xs text-grafite/60 hover:text-magenta"
            >
              Excluir
            </button>
          </div>
        )}
      </div>

      {/* Formulário de edição */}
      {editOpen && (
        <form
          action={async (fd) => {
            await updateTask(fd);
            setEditOpen(false);
          }}
          className="mt-3 pt-3 border-t border-gray-100 space-y-3"
        >
          <input type="hidden" name="task_id" value={task.id} />
          <input type="hidden" name="project_id" value={task.project_id} />
          <div>
            <label className="block text-xs mb-1">Título</label>
            <input
              name="title"
              defaultValue={task.title}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Descrição</label>
            <textarea
              name="description"
              rows={4}
              defaultValue={task.description ?? ""}
              className={inputClass}
              placeholder="Use Enter para separar em parágrafos. Links (https://...) ficam clicáveis."
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs mb-1">Responsável</label>
              <select
                name="assignee_id"
                defaultValue={task.assignee_id ?? ""}
                className={inputClass}
              >
                <option value="">— Ninguém —</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name ?? "Sem nome"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Estimativa (h)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                name="estimate_hours"
                defaultValue={task.estimate_hours ?? ""}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Prazo</label>
              <input
                type="date"
                name="due_date"
                defaultValue={task.due_date ?? ""}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-magenta text-white px-3 py-1.5 text-sm hover:opacity-90"
            >
              Salvar alterações
            </button>
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-grafite hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Controles: cronômetro, manual, status, subtarefa */}
      <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-gray-100">
        {isActive ? (
          <button
            onClick={() => startT(() => stopTimer(task.id))}
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

        {!isSubtask && canManage && (
          <button
            onClick={() => setSubtaskOpen((v) => !v)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-grafite hover:bg-gray-50"
          >
            + Subtarefa
          </button>
        )}

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

      {/* Formulário de lançamento manual */}
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

      {/* Formulário de nova subtarefa */}
      {subtaskOpen && !isSubtask && (
        <form
          action={async (fd) => {
            await createTask(fd);
            setSubtaskOpen(false);
          }}
          className="mt-3 pt-3 border-t border-gray-100 space-y-3"
        >
          <input type="hidden" name="project_id" value={task.project_id} />
          <input type="hidden" name="parent_task_id" value={task.id} />
          <div>
            <label className="block text-xs mb-1">Título da subtarefa</label>
            <input name="title" required className={inputClass} autoFocus />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs mb-1">Responsável</label>
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
              <label className="block text-xs mb-1">Estimativa (h)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                name="estimate_hours"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Prazo</label>
              <input type="date" name="due_date" className={inputClass} />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-magenta text-white px-3 py-1.5 text-sm hover:opacity-90"
            >
              Salvar subtarefa
            </button>
            <button
              type="button"
              onClick={() => setSubtaskOpen(false)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-grafite hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Subtarefas */}
      {hasSubtasks && (
        <div className="mt-3">
          {canCollapse && (
            <button
              onClick={onToggleCollapse}
              className="text-xs text-grafite/60 hover:text-roxo mb-2"
            >
              {collapsed ? "▸ Mostrar" : "▾ Ocultar"} subtarefas ({subtasks!.length})
            </button>
          )}
          {subtasksVisible && (
            <div className="space-y-2 pl-3 border-l-2 border-gray-100">
              {subtasks!.map((s) => (
                <TaskItem
                  key={s.task.id}
                  task={s.task}
                  seconds={s.seconds}
                  isActive={s.isActive}
                  canManage={canManage}
                  members={members}
                  isSubtask
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
