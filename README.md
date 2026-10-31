# Desafio dos Valentes

Quiz gamificado de estudo biblico com grupos, ranking, midia e administracao.

## Stack

- **Next.js 15** (App Router, RSC + Server Actions)
- **PostgreSQL** via **Prisma**
- **Auth.js (NextAuth v5)** - credentials, sessao JWT
- **Tailwind CSS** + componentes proprios (tema neon, claro/escuro)
- **Framer Motion** + **canvas-confetti** (animacoes)
- **Vercel Blob** (opcional) para upload de midia / **YouTube embed**

## Requisitos

- Node.js 20+
- Um banco PostgreSQL (local ou Neon)

## Configuracao local

1. Instale as dependencias:

   ```bash
   npm install
   ```

2. Crie o `.env` a partir do exemplo:

   ```bash
   cp .env_example .env
   ```

   Preencha `DATABASE_URL`/`DIRECT_URL` e gere um `AUTH_SECRET`:

   ```bash
   openssl rand -base64 32
   ```

3. Aplique o schema e rode o seed (super admin, badges e grupo "10 IEQ" com as perguntas):

   ```bash
   npx prisma db push      # ou: npx prisma migrate dev
   npm run db:seed
   ```

4. Rode em desenvolvimento:

   ```bash
   npm run dev
   ```

   Acesse http://localhost:3000 (login: superadmin / super123, conforme o `.env`)

## Scripts

| Script | Descricao |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de producao |
| `npm run start` | Roda o build de producao |
| `npm run typecheck` | Checagem de tipos |
| `npm run db:push` | Aplica o schema ao banco |
| `npm run db:seed` | Cria super admin, badges e grupo "10 IEQ" |

## Papeis

- **USER**: joga o quiz, entra em grupos, ve ranking.
- **Admin de grupo**: CRUD de perguntas, gerencia membros, remove com justificativa (bloqueio), remove/transfere a administracao.
- **SUPER_ADMIN**: ve todos os grupos/users, promove admins e edita qualquer pergunta (via `/super-admin`).

## Funcionalidades

- Cadastro com usuario, senha e telefone; escolha de emoji; entrada em grupos.
- Quiz com **3 tentativas** por pergunta: 100 / 80 / 50 pontos; erro na 3a revela a resposta (0 ponto).
- Midia por **arquivo local (upload)**, **URL** ou **YouTube embed**.
- Gamificacao: XP, niveis, badges, streak e **ranking** por grupo.
- Telefone dos membros visivel apenas para administradores.
- Bloqueio de membro com justificativa; reingresso somente apos desbloqueio.
- Tema claro/escuro.

## Upload de midia

- Em **desenvolvimento**: se `BLOB_READ_WRITE_TOKEN` estiver vazio, os arquivos sao salvos em `public/uploads/` (ignorado no git).
- Em **producao (Vercel)**: defina `BLOB_READ_WRITE_TOKEN` (Vercel Blob) para que os uploads persistam.
- Tambem e possivel informar uma URL externa ou um link de YouTube.

## Deploy na Vercel

### 1. Banco (Neon)

1. Crie um projeto no [Neon](https://neon.com) e copie as connection strings:
   - **Pooled** (com `-pooler`) -> `DATABASE_URL`
   - **Direct** -> `DIRECT_URL`

### 2. Importar o projeto

1. Suba o repositorio para o GitHub.
2. Na Vercel, **Add New > Project** e importe o repositorio.
3. A Vercel detecta o Next.js automaticamente. Configure as variaveis:

   | Variavel | Valor |
   | --- | --- |
   | `DATABASE_URL` | connection string do Neon (pooled) |
   | `DIRECT_URL` | connection string direta do Neon |
   | `AUTH_SECRET` | `openssl rand -base64 32` |
   | `AUTH_TRUST_HOST` | `true` |
   | `SUPER_ADMIN_USERNAME` | ex.: `superadmin` |
   | `SUPER_ADMIN_PASSWORD` | uma senha |
   | `SUPER_ADMIN_PHONE` | telefone |
   | `BLOB_READ_WRITE_TOKEN` | (opcional) token do Vercel Blob |

4. Deploy.

### 3. Carregar os dados iniciais (perguntas)

O seed **nao roda automaticamente** no deploy. Escolha uma das opcoes:

**Opcao A (recomendada) - rodar o seed da sua maquina apontando para o banco de producao**

No seu computador, com o repositorio clonado:

```bash
# aponte temporariamente para o banco de producao (Neon)
export DATABASE_URL="postgresql://...-pooler..."
export DIRECT_URL="postgresql://..."
export SUPER_ADMIN_USERNAME="superadmin"
export SUPER_ADMIN_PASSWORD="uma-senha-forte"
export SUPER_ADMIN_PHONE="11999999999"

npx prisma db push        # cria as tabelas
npm run db:seed           # cria super admin, badges e grupo "10 IEQ" com as perguntas
```

> Dica: use um `.env.production` local e rode com `dotenv -e .env.production -- npm run db:seed` para nao mexer no seu `.env`.

**Opcao B - rodar via Vercel CLI**

```bash
npm i -g vercel
vercel link                # vincula ao projeto
vercel env pull .env.local # baixa as variaveis de producao
npx prisma db push
npm run db:seed
```

### 4. Como editar as perguntas iniciais

As perguntas do grupo **10 IEQ** ficam em `prisma/questions-data.ts`. Cada item:

```ts
{
  text: 'Enunciado da pergunta',
  mediaUrl: 'https://... (opcional)',
  mediaType: 'image' | 'video',       // opcional
  mediaSource: 'UPLOAD' | 'YOUTUBE',  // opcional
  options: [
    { text: 'Alternativa correta', isCorrect: true },
    { text: 'Alternativa errada', isCorrect: false },
    // ... ao menos 2 alternativas, exatamente 1 correta
  ],
}
```

Para adicionar/alterar perguntas: edite o arquivo, rode `npm run db:seed` novamente (ele recria as perguntas do grupo 10 IEQ) e faca um novo deploy.

> Alternativa sem codigo: entre como super admin, crie um grupo no app e cadastre as perguntas pela tela **Admin > Perguntas** (com upload de imagem/video ou YouTube).

## Limit</｜DSML｜ parameter name=

## Limites gratuitos (referencia)

- **Vercel Hobby**: ~100 deploys/dia, 100 GB de banda. Vercel Blob ~1 GB de storage (estourar bloqueia por 30 dias) -> prefira **YouTube embed** para videos longos.
- **Neon Free**: ~1 GB de storage por projeto, scale-to-zero, 100 CU-hours.
- **Auth.js**: open-source, sem custo (self-hosted na Vercel).

## Documentacao adicional

- `ARQUITETURA.md` - visao tecnica e estrutura de pastas.
- `PLANO.md` - plano de implementacao original.
