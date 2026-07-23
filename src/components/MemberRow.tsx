"use client";

import { useTransition } from "react";
import { setMemberRole } from "@/app/(app)/equipe/actions";
import { ROLE_LABELS, type Role } from "@/lib/types";

export default function MemberRow({
  id,
  name,
  role,
  isSelf,
}: {
  id: string;
  name: string;
  role: Role;
  isSelf: boolean;
}) {
  const [pending, startT] = useTransition();

  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm text-roxo font-medium">
          {name}
          {isSelf && <span className="text-grafite/50 font-normal"> (você)</span>}
        </p>
      </div>
      <select
        value={role}
        disabled={pending || isSelf}
        onChange={(e) =>
          startT(() => setMemberRole(id, e.target.value as Role))
        }
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-grafite disabled:opacity-60"
      >
        {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
    </div>
  );
}
