"use client";

import { useEffect, useState, useTransition } from "react";
import { stopTimer, stopAllTimers } from "@/app/(app)/actions";
import { formatStopwatch } from "@/lib/format";

export type Active = {
  id: string;
  taskId: string;
  taskTitle: string;
  projectName: string;
  startedAt: string;
};

export default function ActiveTimerBar({ actives }: { actives: Active[] }) {
  const [now, setNow] = useState<number | null>(null);
  const [pending, startT] = useTransition();

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (actives.length === 0) {
    return <div className="text-sm text-grafite/70">Nenhum cronômetro rodando.</div>;
  }

  const elapsedOf = (startedAt: string) =>
    now ? Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000)) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-grafite/70">
          {actives.length === 1
            ? "1 cronômetro rodando"
            : `${actives.length} cronômetros rodando`}
        </span>
        {actives.length > 1 && (
          <button
            onClick={() => startT(() => stopAllTimers())}
            disabled={pending}
            className="text-xs text-roxo hover:underline disabled:opacity-60"
          >
            Parar todos
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        {actives.map((a) => (
          <div key={a.id} className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-magenta animate-pulse shrink-0" />
            <div className="text-sm min-w-0">
              <span className="font-medium text-roxo">{a.taskTitle}</span>
              <span className="text-grafite/70"> · {a.projectName}</span>
            </div>
            <span className="font-mono text-base text-roxo tabular-nums ml-auto">
              {formatStopwatch(elapsedOf(a.startedAt))}
            </span>
            <button
              onClick={() => startT(() => stopTimer(a.taskId))}
              disabled={pending}
              className="rounded-lg bg-roxo text-white px-3 py-1 text-sm hover:opacity-90 disabled:opacity-60"
            >
              Parar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
