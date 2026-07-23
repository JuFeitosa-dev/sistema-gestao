import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";
import MemberRow from "@/components/MemberRow";

export default async function EquipePage() {
  const profile = await getCurrentProfile();
  if (profile.role !== "admin") redirect("/dashboard");

  const supabase = await createClient();
  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">Equipe</h1>
        <p className="text-sm text-grafite/70 mt-1">
          Defina o papel de cada pessoa. <strong>Admin</strong> vê tudo,{" "}
          <strong>Gestor</strong> gerencia projetos e tarefas,{" "}
          <strong>Colaborador</strong> aponta as próprias horas.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {members?.map((m) => (
          <MemberRow
            key={m.id}
            id={m.id}
            name={m.full_name ?? "Sem nome"}
            role={m.role as Role}
            isSelf={m.id === profile.id}
          />
        ))}
      </div>

      <p className="text-xs text-grafite/60">
        Para adicionar alguém à equipe, peça para a pessoa criar uma conta na tela
        de login. Ela entra como “Colaborador” e você ajusta o papel aqui.
      </p>
    </div>
  );
}
