-- ============================================================================
--  Fase 1 — Ajuste: subtarefas
--  Permite que uma tarefa tenha sub-tarefas (ex.: "Roteirizar aulas" com
--  "Roteirizar módulo 1", "Roteirizar módulo 2"...).
--
--  Como usar: cole no SQL Editor do Supabase e clique em RUN. É seguro rodar
--  mais de uma vez.
-- ============================================================================

-- Uma tarefa pode apontar para uma "tarefa-mãe". Se a tarefa-mãe for apagada,
-- as sub-tarefas vão junto (on delete cascade).
alter table public.tasks
  add column if not exists parent_task_id uuid
  references public.tasks(id) on delete cascade;

create index if not exists tasks_parent_idx
  on public.tasks(parent_task_id);
