# Desafio dos Valentes

Quiz gamificado de estudo biblico com grupos, ranking, midia e administracao.

## Stack

- **Next.js 15** (App Router, RSC + Server Actions)
- **Postgres** via **Prisma**
- **Auth.js (NextAuth v5)** — credentials, sessao JWT
- **Tailwind CSS** + componentes proprios estilizados (tema neon)
- **Framer Motion** + **canvas-confetti** (animacoes)
- **Vercel Blob** (opcional) para upload de midia / **YouTube embed**

## Requisitos

- Node.js 20+
- Um banco Postgres acessivel

## Configuracao

1. Instale as dependencias:

   ```bash
   npm install
   ```

2. Edite o arquivo `.env` com as credenciais do banco (ajuste usuario e senha):

   ```
   DATABASE_URL="postgresql://USUARIO:SENHA@172.18.0.1:5432/desafio-valentes?schema=public"
   DIRECT_URL="postgresql://USUARIO:SENHA@172.18.0.1:5432/desafio-valentes?schema=public"
   AUTH_SECRET="gere-com: openssl rand -base64 32"
   AUTH_TRUST_HOST="true"
   SUPER_ADMIN_USERNAME="superadmin"
   SUPER_ADMIN_PASSWORD="super123"
   SUPER_ADMIN_PHONE="11999999999"
   ```

3. Aplique o schema e crie o(s) super admin / badges:

   ```bash
   npx prisma db push      # ou: npx prisma migrate dev
   npm run db:seed
   ```

4. Rode em desenvolvimento:

   ```bash
   npm run dev
   ```

   Acesse http://localhost:3000

## Scripts

| Script | Descricao |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de producao |
| `npm run typecheck` | Checagem de tipos |
| `npm run db:push` | Aplica o schema ao banco |
| `npm run db:seed` | Cria super admin e badges |

## Papeis

- **USER**: joga o quiz, entra em grupos, ve ranking.
- **Admin de grupo**: cria/edita/exclui perguntas, gerencia membros, bloqueia com justificativa, transfere administracao.
- **SUPER_ADMIN**: ve todos os grupos, promove admins de qualquer grupo e edita qualquer pergunta (via `/super-admin`).

## Funcionalidades

- Cadastro com usuario, senha e telefone; entrada em grupos.
- Quiz com **3 tentativas** por pergunta: 100 / 80 / 50 pontos; erro na 3a revela a resposta (0 ponto).
- Midia por imagem/video proprio (URL/Blob) ou **YouTube embed**.
- Gamificacao: XP, niveis, badges, streak e **ranking** por grupo.
- Telefone dos membros visivel apenas para administradores.
- Bloqueio de membro com justificativa; reingresso somente apos desbloqueio.

## Deploy (Vercel + Neon)

1. Crie um banco no Neon e copie a connection string (pooled e direct).
2. Configure as variaveis no projeto da Vercel (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST`, e `SUPER_ADMIN_*`).
3. Rode `npx prisma db push` (ou migrations) apontando para o banco de producao e depois `npm run db:seed`.

> **Limites gratuitos:** Vercel Hobby ~100 deploys/dia e 100 GB de banda; Vercel Blob ~1 GB de storage (estourar bloqueia por 30 dias) -> prefira **YouTube embed** para videos; Neon Free ~1 GB de storage por projeto e 100 CU-hours.
