-- ============================================================================
--  Fase 1 — Ajuste: vários cronômetros simultâneos
--  Remove a trava de "um cronômetro ativo por vez por usuário" e passa a
--  permitir vários cronômetros rodando ao mesmo tempo (tarefas diferentes,
--  vários computadores na mesma conta). A única regra que fica: não iniciar
--  DUAS vezes o cronômetro na MESMA tarefa (evita contar em dobro).
--
--  Como usar: cole no SQL Editor do Supabase e clique em RUN. É seguro.
-- ============================================================================

-- Remove a trava antiga (um ativo por usuário).
drop index if exists public.one_active_timer_per_user;

-- Nova regra: no máximo um cronômetro ativo por (usuário + tarefa).
create unique index if not exists one_active_timer_per_user_task
  on public.time_entries (user_id, task_id)
  where ended_at is null;
