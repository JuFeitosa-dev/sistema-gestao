"use client";

import { useState } from "react";
import TaskItem, { type Task, type SubtaskData } from "./TaskItem";
import type { Member } from "@/lib/types";

export type ParentItem = {
  task: Task;
  seconds: number;
  isActive: boolean;
  includesSubtasks: boolean;
  subtasks: SubtaskData[];
};

export default function ProjectTaskList({
  items,
  canManage,
  members,
}: {
  items: ParentItem[];
  canManage: boolean;
  members: Member[];
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const withSubtasks = items.filter((i) => i.subtasks.length > 0);
  const anyExpanded = withSubtasks.some((i) => !collapsed[i.task.id]);

  function toggleAll() {
    if (anyExpanded) {
      const next: Record<string, boolean> = {};
      withSubtasks.forEach((i) => {
        next[i.task.id] = true;
      });
      setCollapsed(next);
    } else {
      setCollapsed({});
    }
  }

  function toggleOne(id: string) {
    setCollapsed((c) => ({ ...c, [id]: !c[id] }));
  }

  return (
    <div className="space-y-3">
      {withSubtasks.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={toggleAll}
            className="text-sm text-grafite/70 hover:text-roxo"
          >
            {anyExpanded
              ? "Recolher todas as subtarefas"
              : "Expandir todas as subtarefas"}
          </button>
        </div>
      )}

      {items.map((i) => (
        <TaskItem
          key={i.task.id}
          task={i.task}
          seconds={i.seconds}
          isActive={i.isActive}
          canManage={canManage}
          members={members}
          subtasks={i.subtasks}
          includesSubtasks={i.includesSubtasks}
          collapsed={!!collapsed[i.task.id]}
          onToggleCollapse={
            i.subtasks.length > 0 ? () => toggleOne(i.task.id) : undefined
          }
        />
      ))}
    </div>
  );
}
