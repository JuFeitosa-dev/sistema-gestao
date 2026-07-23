"use client";

import { useActionState, useState } from "react";
import { login, signup, type AuthState } from "./actions";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const action = mode === "login" ? login : signup;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    {},
  );

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-roxo">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl">Laboratório de Criatividade</h1>
          <p className="text-sm text-grafite mt-1">
            Gestão de tarefas e apontamento de horas
          </p>
        </div>

        <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 text-sm rounded-md transition ${
              mode === "login"
                ? "bg-white shadow-sm text-roxo font-medium"
                : "text-grafite"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 text-sm rounded-md transition ${
              mode === "signup"
                ? "bg-white shadow-sm text-roxo font-medium"
                : "text-grafite"
            }`}
          >
            Criar conta
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-sm mb-1" htmlFor="full_name">
                Seu nome
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                autoComplete="name"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-magenta focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-magenta focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-magenta focus:outline-none"
            />
          </div>

          {state.error && (
            <p className="text-sm text-magenta bg-magenta/5 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}
          {state.message && (
            <p className="text-sm text-roxo bg-roxo/5 rounded-lg px-3 py-2">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-magenta text-white rounded-lg py-2.5 font-medium hover:opacity-90 transition disabled:opacity-60"
          >
            {pending
              ? "Aguarde..."
              : mode === "login"
                ? "Entrar"
                : "Criar conta"}
          </button>
        </form>
      </div>
    </main>
  );
}
