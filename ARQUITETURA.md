# Desafio dos Valentes — Arquitectura

> Documento de contexto rapido para modelos de IA. Descreve estrutura, stack e convencoes atuais.

## 1. Visao geral

Quiz biblico gamificado com grupos, ranking, midia (imagem/video proprio ou YouTube) e administracao hierarquica (usuario / admin de grupo / super admin). Mobile-first. Frontend e backend no mesmo app Next.js.

## 2. Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 15 (App Router, RSC + Server Actions) |
| Linguagem | TypeScript (strict) |
| Estilo | Tailwind CSS 3.4 + tokens CSS customizados (tema neon, dark/light) |
| Animacoes | Framer Motion, canvas-confetti |
| Icones | lucide-react |
| Autenticacao | Auth.js (NextAuth v5), Credentials + JWT |
| Banco | PostgreSQL via Prisma ORM |
| Hash de senha | bcryptjs |
| Validacao | Zod |
| Toasts | sonner |
| Tema | next-themes |
| Fontes | Inter (corpo) + Outfit (display) via next/font |

## 3. Estrutura de pastas

```
prisma/
  schema.prisma        # modelos do banco
  seed.ts              # cria super admin, badges e grupo "10 IEQ" com 30 perguntas
  questions-data.ts    # dados das perguntas biblicas (com midia)
src/
  app/
    layout.tsx         # html/body, fontes, Providers, metadata/viewport
    page.tsx           # redireciona para /groups ou /login
    globals.css        # tokens de tema, glass, glow, a11y reduced-motion
    (auth)/            # login, register (layout centralizado, sem header)
    (app)/             # area autenticada com SiteHeader
      groups/          # lista e detalhe do grupo (ranking)
      groups/[groupId]/quiz/
      profile/
      achievements/
    admin/groups/[groupId]/  # painel do admin do grupo (questions, members, admins, banned)
    super-admin/       # painel global do super admin
    api/auth/[...nextauth]/route.ts
  actions/             # Server Actions (mutation + queries server-side)
    auth.ts, groups.ts, quiz.ts, questions.ts, admin.ts, ranking.ts, super-admin.ts
  components/
    ui/                # design system base (button, card, input, avatar, emoji-picker...)
    quiz/              # quiz-player, media-view
    gamification/      # xp-bar, tries-indicator, points-counter, confetti, rank-medal
    groups/            # group-list, create-group-dialog
    admin/             # question-manager, question-editor, media-fields, member/admin actions
    auth/              # auth-form
    providers.tsx      # ThemeProvider + SessionProvider + Toaster
    site-header.tsx, theme-toggle.tsx
  lib/
    db.ts              # Prisma client singleton
    auth.ts            # config Auth.js (providers, callbacks)
    guards.ts          # requireUser, requireSuperAdmin, assertGroupAdmin, isGroupAdmin
    scoring.ts         # pontos por tentativa, niveis, badges
    validation.ts      # schemas Zod (question, option, media, youtube)
    emojis.ts          # listas de emojis (grupo/usuario) + fallbacks
    media.ts           # resolve media (upload vs youtube)
    utils.ts           # cn()
  types/next-auth.d.ts # augmenta Session com id/role/username
```

## 4. Modelo de dados (Prisma)

- **Role**: `USER` | `SUPER_ADMIN`
- **MediaSource**: `UPLOAD` | `YOUTUBE`

| Modelo | Campos-chave | Relacoes |
| --- | --- | --- |
| `User` | username (unico), password (hash), phone, role, emoji, avatarSeed | memberships, attempts, adminOfGroups, stat, badges, bans |
| `Group` | name, description, emoji, adminId | admin, members, questions, bans |
| `GroupMember` | score, joinedAt | group, user — unico (groupId,userId) |
| `Ban` | reason, bannedBy | group, user — unico (groupId,userId) |
| `Question` | text, mediaUrl, mediaType, mediaSource, order | group, options, attempts |
| `Option` | text, isCorrect, mediaUrl, mediaType, mediaSource | question |
| `Attempt` | triesUsed, solved, pointsEarned | user, question — unico (userId,questionId) |
| `UserStats` | totalPoints, level, streakDays, lastPlayed | user (1:1) |
| `Badge` | code (unico), name, description, emoji | users |
| `UserBadge` | earnedAt | user, badge — unico (userId,badgeId) |

## 5. Regras de negocio

### Pontuacao / tentativas
- 3 tentativas por pergunta. Acerto: 1a=100, 2a=80, 3a=50; erro na 3a = 0 (revela resposta).
- Logica em `src/actions/quiz.ts` (`submitAnswer`), validada no servidor. Atualiza `Attempt`, `GroupMember.score` e `UserStats` em transacao.
- `src/lib/scoring.ts`: `pointsForTry`, `levelFromPoints` (500 pts/nivel), `levelTitle`, `progressToNextLevel`, `BADGE_DEFS`.

### Papeis
- **Usuario**: cadastra, entra em grupos, joga, ve ranking/perfil/conquistas.
- **Admin de grupo**: CRUD de perguntas do grupo, gerencia membros, remove com justificativa (Ban), desbloqueia, transfere administracao.
- **Super admin**: ve todos os grupos/usuarios, promove admins, edita qualquer pergunta (painel `/super-admin`).
- Autorizacao centralizada em `src/lib/guards.ts`.

### Privacidade
- Telefone so e retornado ao admin do grupo / super admin (selecao explicita no servidor).

### Midia
- `UPLOAD`: imagem/video proprio (URL). `YOUTUBE`: URL do video, renderizado via iframe embed (`media-view.tsx`).

## 6. Rotas

| Rota | Descricao |
| --- | --- |
| `/login`, `/register` | autenticacao |
| `/groups` | lista (Meus grupos / Explorar) e criacao |
| `/groups/[groupId]` | detalhe + ranking |
| `/groups/[groupId]/quiz` | jogar quiz |
| `/profile` | perfil, XP, badges, grupos |
| `/achievements` | colecao de badges |
| `/admin/groups/[groupId]/{questions,members,admins,banned}` | gestao do grupo |
| `/super-admin` | painel global |
| `/api/auth/[...nextauth]` | handlers Auth.js |
| `/api/upload` | upload de imagem/video (Vercel Blob ou public/uploads local) |

## 7. Design system / UX

- Tema neon (roxo/ciano/rosa/lima), dark por padrao e light alternavel (ThemeToggle).
- Utilitarios CSS: `.text-gradient`, `.glow-*`, `.glass`.
- Componentes gamificados: XPBar, TriesIndicator (coracoes), PointsCounter, confetti ao acertar, medalhas de ranking.
- Mobile-first: header com scroll, modais bottom-sheet, area de toque grande, safe-area insets, `prefers-reduced-motion`.

## 8. Variaveis de ambiente (.env)

```
DATABASE_URL            # postgresql://...
DIRECT_URL              # postgresql://... (idem)
AUTH_SECRET             # openssl rand -base64 32
AUTH_TRUST_HOST=true
SUPER_ADMIN_USERNAME, SUPER_ADMIN_PASSWORD, SUPER_ADMIN_PHONE
BLOB_READ_WRITE_TOKEN   # opcional (upload proprio)
```

## 9. Comandos

```bash
npm install
npx prisma db push      # ou npx prisma migrate dev
npm run db:seed         # super admin + badges + grupo "10 IEQ" (32 perguntas)
npm run dev             # http://localhost:3000
npm run build
npm run typecheck
```

## 10. Convencoes para edicao

- Mutacoes sempre em `src/actions/*` (Server Actions) com `revalidatePath` quando necessario.
- Verificacao de permissao via `src/lib/guards.ts` antes de qualquer operacao sensivel.
- Nunca expor `isCorrect` ou telefone ao cliente antes da hora combinada.
- Estilo: classes Tailwind com variantes responsivas (`sm:`, `md:`) para tudo que pode estourar no mobile.
- Sem comentarios no codigo, salvo quando estritamente necessario.
