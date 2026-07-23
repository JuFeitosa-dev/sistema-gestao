"use client";

import { useEffect, useState, useTransition } from "react";
import { stopTimer } from "@/app/(app)/actions";
import { formatStopwatch } from "@/lib/format";

type Active = {
  id: string;
  taskTitle: string;
  projectName: string;
  startedAt: string;
} | null;

export default function ActiveTimerBar({ active }: { active: Active }) {
  const [elapsed, setElapsed] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!active) return;
    const start = new Date(active.startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active]);

  if (!active) {
    return (
      <div className="text-sm text-grafite/70">
        Nenhum cronômetro rodando.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-magenta animate-pulse" />
      <div className="text-sm">
        <span className="font-medium text-roxo">{active.taskTitle}</span>
        <span className="text-grafite/70"> · {active.projectName}</span>
      </div>
      <span className="font-mono text-lg text-roxo tabular-nums">
        {formatStopwatch(elapsed)}
      </span>
      <button
        onClick={() => startTransition(() => stopTimer())}
        disabled={pending}
        className="ml-auto sm:ml-0 rounded-lg bg-roxo text-white px-3 py-1.5 text-sm hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Parando..." : "Parar"}
      </button>
    </div>
  );
}
