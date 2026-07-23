"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { signOut } from "@/app/(app)/actions";
import type { Role } from "@/lib/types";

const LINKS = [
  { href: "/dashboard", label: "Início" },
  { href: "/projetos", label: "Projetos" },
  { href: "/tarefas", label: "Tarefas" },
  { href: "/relatorios", label: "Relatórios" },
];

export default function Nav({
  role,
  userName,
}: {
  role: Role;
  userName: string;
}) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const links = [...LINKS];
  if (role === "admin") {
    links.push({ href: "/equipe", label: "Equipe" });
  }

  return (
    <header className="bg-roxo text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 gap-4">
          <span className="font-display text-base sm:text-lg whitespace-nowrap">
            Laboratório de Criatividade
          </span>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-white/60">
              {userName}
            </span>
            <button
              onClick={() => startTransition(() => signOut())}
              disabled={pending}
              className="rounded-lg px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-60"
            >
              {pending ? "Saindo..." : "Sair"}
            </button>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto -mb-px">
          {links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap px-3 py-2.5 text-sm border-b-2 transition ${
                  active
                    ? "border-magenta text-white font-medium"
                    : "border-transparent text-white/70 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
