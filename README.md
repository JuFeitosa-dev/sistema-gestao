# Sistema de Gestão — Laboratório de Criatividade (Fase 1)

Sistema web para **apontamento de horas** e **gestão de tarefas**. Mede quanto
tempo cada projeto consome, por pessoa e por período.

> **Fase 1** entrega: login, projetos, tarefas, cronômetro (start/stop) +
> lançamento manual de horas, e relatórios de horas. A camada financeira
> (custo, margem, comissão) é a Fase 2 e ainda **não** faz parte deste sistema.

---

## As 3 peças que fazem o sistema funcionar

| Peça | O que faz | Custo |
|------|-----------|-------|
| **Supabase** | Banco de dados na nuvem + login (email/senha) | Grátis |
| **Vercel** | Coloca o site no ar num endereço acessível pelo navegador | Grátis |
| **Next.js** | A tecnologia em que o site foi escrito (as telas + a lógica) | — |

---

## Como colocar no ar (passo a passo, uma vez só)

### 1. Criar as tabelas no banco (Supabase)
1. Entre no [Supabase](https://supabase.com) e abra o projeto.
2. No menu à esquerda, clique em **SQL Editor** → **New query**.
3. Abra o arquivo [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   deste repositório, **copie todo o conteúdo**, cole no editor e clique em **RUN**.
4. Deve aparecer "Success". Isso cria todas as tabelas, a segurança e já cadastra
   a organização "Laboratório de Criatividade" com suas áreas internas.

### 2. Ajustar o login (Supabase)
Para o time começar a usar rápido, sem etapa de confirmação de email:
1. No Supabase, vá em **Authentication** → **Sign In / Providers** (ou **Providers → Email**).
2. **Desligue** a opção **"Confirm email"** e salve.
   (Assim, quem cria a conta já entra direto. Dá para religar isso no futuro.)

### 3. Colocar o site no ar (Vercel)
1. Entre na [Vercel](https://vercel.com) com a conta do GitHub.
2. **Add New → Project** e selecione o repositório `sistema-gestao`.
3. Em **Environment Variables**, adicione as duas variáveis (valores no Supabase,
   em **Settings → API**):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Clique em **Deploy**. Em ~2 minutos o site estará no ar num endereço
   `algo.vercel.app`.

### 4. Primeiro acesso
1. Abra o endereço da Vercel e clique em **Criar conta**.
2. **A primeira pessoa que se cadastrar vira Admin automaticamente** (deve ser a Ju).
3. As próximas pessoas entram como **Colaborador**. O Admin ajusta os papéis na
   tela **Equipe**.

---

## Papéis de acesso

- **Admin** — vê e faz tudo; define papéis na tela Equipe.
- **Gestor** — cria e gerencia projetos e tarefas.
- **Colaborador** — aponta as próprias horas e mexe nas próprias tarefas.

---

## Como fazer mudanças no sistema

O código fica no GitHub. Toda vez que uma alteração é enviada (push) para a
branch principal, **a Vercel atualiza o site sozinha**. Na prática, quem mantém
pede as mudanças aqui no Claude Code, revisa e envia — a Vercel cuida do resto.

Para mexer no visual ou nos textos, os arquivos das telas ficam em
`src/app`. Os componentes reutilizáveis (botões, formulários) ficam em
`src/components`. A "planta do banco" fica em `supabase/migrations`.

---

## Rodar na sua própria máquina (opcional, para quem for programar)

```bash
npm install
cp .env.example .env.local   # preencha as duas variáveis do Supabase
npm run dev                  # abre em http://localhost:3000
```
