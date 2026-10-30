# Plano de Implementação — Quiz de Estudo Bíblico (Gamificado)

## 1. Visão Geral

Sistema de quiz bíblico voltado a adolescentes, com grupos, competição gamificada e ranking. Deve rodar **100% em navegador**, ser hospedado em infra gratuita (Vercel) e usar **Neon (Postgres serverless)**.

**Stack definida (fechada):** Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui + Framer Motion + Prisma + **Neon Postgres** + Auth.js + Vercel Blob. Hospedagem na Vercel. Sem backend separado.

---

## 2. Análise das Opções Técnicas

### Frontend
- **Next.js 15 (App Router)** com SSR/RSC, Server Actions e Route Handlers — integração nativa com a Vercel. ✅

### Banco de Dados
- **Neon — Postgres serverless** (`@prisma/adapter-neon`), free tier, branching, integrado à Vercel. ✅

### ORM
- **Prisma** — migrations, DX e integração com o driver serverless do Neon. ✅

### Autenticação
- **Auth.js (NextAuth v5)** com Credentials Provider (usuário + senha + telefone). ✅
- Senha "fraca" conforme requisito → apenas hash (bcrypt/argon2) sem políticas rígidas.

### Armazenamento de mídia (imagem/vídeo)
- **Vercel Blob** — upload de imagem e vídeo próprio. ✅
- **YouTube embed** — vídeos podem ser referenciados por URL (sem ocupar storage). ✅

### Design System
- **Tailwind CSS v4** + **shadcn/ui** (componentes) + **Framer Motion** (animações gamificadas).
- Tema adolescente: cores vibrantes (neon), avatares, badges, barras XP, confetti.

---

## 3. Arquitetura

```
Next.js (App Router) ── Vercel
   │
   ├── Server Actions / Route Handlers  (regra de negócio)
   ├── Prisma ── Neon Postgres (serverless driver)
   ├── Auth.js (sessão JWT) ── Credentials
   └── Vercel Blob (upload imagem/vídeo)
```

Sem backend separado: toda lógica via **Server Actions** + **Route Handlers** do Next.js.

### Organização de pastas (proposta)
```
src/
├── app/                     # rotas (ver seção 6)
├── components/
│   ├── ui/                  # shadcn customizado
│   ├── quiz/                # QuizCard, OptionButton, TriesIndicator...
│   └── gamification/        # XPBar, Leaderboard, Podium, BadgeChip...
├── lib/
│   ├── auth.ts              # Auth.js config
│   ├── db.ts                # Prisma client (adapter Neon)
│   ├── scoring.ts           # regras de pontuação/nível/badges
│   ├── youtube.ts           # parse/embed de URL do YouTube
│   └── validators/          # schemas Zod
├── actions/                 # Server Actions (quiz, grupos, admin)
└── styles/                  # tokens, tailwind theme
```

### Estado no cliente
- **React Server Components** para dados; **Server Actions** para mutações.
- Estado local de quiz com `useReducer` (tentativas, feedback).
- **Zod** para validação de formulários (client + server).
- **next-themes** para tema claro/escuro.
- Feedback instantâneo otimista com `useOptimistic`.

---

## 4. Modelo de Dados (Prisma/Postgres)

```prisma
enum Role {
  USER
  SUPER_ADMIN
}

model User {
  id           String   @id @default(cuid())
  username     String   @unique
  password     String              // hash
  phone        String              // visível só para admins do grupo / super admin
  role         Role     @default(USER)
  avatarUrl    String?
  createdAt    DateTime @default(now())
  memberships  GroupMember[]
  attempts     Attempt[]
  adminOfGroups Group[] @relation("GroupAdmin")
  stat         UserStats?
  badges       UserBadge[]
}

model Group {
  id        String   @id @default(cuid())
  name      String
  adminId   String
  admin     User     @relation("GroupAdmin", fields: [adminId], references: [id])
  createdAt DateTime @default(now())
  members   GroupMember[]
  questions Question[]
  bans      Ban[]
}

model GroupMember {
  id       String  @id @default(cuid())
  groupId  String
  userId   String
  group    Group @relation(fields: [groupId], references: [id])
  user     User  @relation(fields: [userId], references: [id])
  score    Int     @default(0)   // pontuação agregada no grupo
  joinedAt DateTime @default(now())
  @@unique([groupId, userId])
}

model Ban {
  id        String   @id @default(cuid())
  groupId   String
  userId    String
  reason    String             // justificativa obrigatória
  bannedBy  String
  createdAt DateTime @default(now())
  group     Group @relation(fields: [groupId], references: [id])
  @@unique([groupId, userId])
}

enum MediaSource {
  UPLOAD      // arquivo enviado (Vercel Blob)
  YOUTUBE     // URL de vídeo do YouTube (embed)
}

model Question {
  id          String  @id @default(cuid())
  groupId     String
  text        String
  mediaUrl    String?            // blob URL ou URL do YouTube
  mediaType   String?            // "image" | "video"
  mediaSource MediaSource?       // UPLOAD | YOUTUBE
  order       Int     @default(0)
  group       Group @relation(fields: [groupId], references: [id])
  options     Option[]
  attempts    Attempt[]
}

model Option {
  id          String  @id @default(cuid())
  questionId  String
  text        String
  isCorrect   Boolean @default(false)
  mediaUrl    String?            // mídia opcional na resposta
  mediaType   String?            // "image" | "video"
  mediaSource MediaSource?       // UPLOAD | YOUTUBE
  question    Question @relation(fields: [questionId], references: [id])
}

model Attempt {
  id           String   @id @default(cuid())
  userId       String
  questionId   String
  triesUsed    Int      @default(0) // 1..3
  solved       Boolean  @default(false)
  pointsEarned Int      @default(0) // 100 / 80 / 50 / 0
  updatedAt    DateTime @updatedAt
  user         User @relation(fields: [userId], references: [id])
  question     Question @relation(fields: [questionId], references: [id])
  @@unique([userId, questionId])
}

// ---------- Gamificação ----------

model UserStats {
  userId      String   @id
  totalPoints Int      @default(0)
  level       Int      @default(1)
  streakDays  Int      @default(0)
  lastPlayed  DateTime?
  user        User @relation(fields: [userId], references: [id])
}

model Badge {
  id          String  @id @default(cuid())
  code        String  @unique   // ex.: "first_correct", "streak_5", "top1"
  name        String
  description String
  iconUrl     String?
  users       UserBadge[]
}

model UserBadge {
  id       String   @id @default(cuid())
  userId   String
  badgeId  String
  earnedAt DateTime @default(now())
  user     User  @relation(fields: [userId], references: [id])
  badge    Badge @relation(fields: [badgeId], references: [id])
  @@unique([userId, badgeId])
}
```

> `User.stat` e `User.badges` completam as relações. `Question.attempts` também é adicionado. O ranking de grupo usa `GroupMember.score` (sincronizado a partir de `Attempt`).

---

## 5. Regras de Negócio

### Pontuação
| Acerto | Pontos |
|---|---|
| 1ª tentativa | 100 |
| 2ª tentativa | 80 |
| 3ª tentativa | 50 |
| Erro na 3ª | 0 (revela resposta) |

- Cada usuário tem no máximo **3 tentativas** por pergunta (controlado em `Attempt`).
- Pontos somados em `GroupMember.score` para ranking por grupo.
- Ao esgotar 3 tentativas sem acerto → exibir resposta correta e marcar `solved=false`.

### Grupos & Admin
- Admin do grupo pode criar/editar/excluir perguntas e respostas do seu grupo.
- Admin pode **conceder administração do grupo a um membro comum** — a partir daí o usuário passa a ser admin daquele grupo (e pode ser revertido/transferido).
- Admin remove membro → cria `Ban` com **justificativa obrigatória**.
- Membro banido não reingressa; só reintegra se admin o **remove da lista de bloqueados**.
- Telefone dos membros: retornado apenas em rotas/actions verificando que o solicitante é admin daquele grupo ou super admin.

### Super Admin
- Papel global `SUPER_ADMIN` (atribuído por seed/infra, não auto-atribuível).
- Pode **ver todos os grupos** e todos os usuários.
- Pode **promover qualquer usuário a admin de um grupo específico**.
- Pode **editar/excluir qualquer pergunta** de qualquer grupo.
- Acesso a um painel global de administração.

### Mídia das perguntas/respostas
- Cada pergunta ou resposta pode ter mídia opcional, com `mediaSource`:
  - **UPLOAD** → arquivo enviado para o Vercel Blob (imagem ou vídeo próprio); `mediaUrl` = URL do blob.
  - **YOUTUBE** → `mediaUrl` = URL do YouTube; renderizado via `<iframe>` embed.
- Imagens exibidas inline; vídeos via player nativo (upload) ou embed do YouTube.
- Validação de URL do YouTube (extrair ID e montar `https://www.youtube.com/embed/{id}`).

### Conta
- Cadastro: usuário + senha fraca + telefone → escolhe grupo na lista.
- Novos usuários entram como `USER`; elevação a admin só por admin do grupo (transferência) ou super admin.

---

## 6. Estrutura de Rotas

```
app/
├── (auth)/login | register
├── (app)/
│   ├── groups/            listar e entrar em grupos
│   ├── quiz/[groupId]/    responder perguntas (3 tentativas, animado)
│   ├── ranking/[groupId]/ pódio + colocação + XP
│   ├── achievements/      badges e conquistas
│   └── profile/           avatar, nível, streak
├── admin/
│   └── groups/[groupId]/
│       ├── questions/     CRUD + mídia (upload/YouTube)
│       ├── members/       telefones, remover c/ justificativa
│       ├── admins/        conceder/transferir administração
│       └── banned/        gerenciar bloqueados
├── super-admin/
│   ├── groups/            ver todos os grupos
│   ├── users/             promover usuário a admin de grupo
│   └── questions/         editar qualquer pergunta
└── api/
    ├── auth/[...nextauth]/
    └── upload/            Vercel Blob
```

---

## 7. Design System & UX (adolescente, moderno e gamificado)

### 7.1 Direção visual
- **Estética:** "neon arcade + dark mode", inspirada em apps como Duolingo, Kahoot, Discord e jogos mobile (Fortnite/Roblox vibe).
- **Modo escuro como padrão**, com opção de tema claro. Fundo com gradientes animados e "glow" sutil.
- **Paleta:**
  - Primária: roxo/violeta (`#7C3AED`), Ciano (`#22D3EE`), Rosa/Magenta (`#EC4899`), Lima (`#A3E635`).
  - Feedback: verde sucesso (`#22C55E`), vermelho erro (`#EF4444`), âmbar alerta (`#F59E0B`).
  - Gradientes neon (roxo→ciano→rosa) nos CTAs e headers.
- **Tipografia:** display arredondada e bold (ex.: **Outfit**/**Space Grotesk**/**Fredoka**) para títulos; **Inter** para corpo. Números de pontos/rank em fonte tabular.
- **Forma:** cantos bem arredondados (radius 16–24px), sombras coloridas (glow), "chunky" buttons estilo jogo, bordas 2px com contraste.
- **Emojis/ícones:** uso liberal de emojis e ícones (lucide-react) para dar leveza e linguagem jovem.

### 7.2 Biblioteca de animações
- **Framer Motion** para transições de página, listas e micro-interações.
- **canvas-confetti** para comemorações (acerto, subida no rank, badge novo).
- **react-spring** opcional para física de mola em cards.
- **Lottie** (lottie-react) para animações ilustrativas (troféu, level-up, mascote).
- **View Transitions API** (Next.js) para navegação entre telas do quiz.

### 7.3 Inventário de animações / feedback
| Momento | Animação / feedback |
|---|---|
| Acerto | Opção "pula", brilha verde, pontos voam para a barra de XP, confetti |
| Erro | Shake horizontal, brilho vermelho, vibração (mobile `navigator.vibrate`) |
| Última tentativa | Tela escurece levemente, tensão (zoom lento), som de suspense |
| Acerto na 3ª | Reveal dramático + "Ufa!" + pontuação menor destacada |
| Fim da pergunta (3 erros) | Reveal da resposta com animação de "abrir baú" |
| Ganho de pontos | Contador numérico animado (count-up) |
| Subida no ranking | Reordenação animada da lista (`layout` do Framer Motion) + flash |
| Nova badge/conquista | Modal com Lottie + confetti, som de recompensa |
| Streak | Chama 🔥 animada crescendo |
| Loading | Skeletons com shimmer + spinner temático |
| Transição de pergunta | Slide horizontal estilo stories/Tinder |
| Entrada na tela | Fade+slide em cascata (stagger) dos cards |

### 7.4 Sistema de Gamificação
- **XP / Pontos:** barra de progresso animada, contador count-up.
- **Níveis:** progressão (ex.: a cada 500 pts sobe de nível) com título ("Novo Discípulo", "Estudioso", "Mestre").
- **Badges/conquistas:** ex. "Primeira pergunta", "Acertou de primeira", "Sequência de 5", "Top 1 do grupo", "Maratonista".
- **Streak diário:** dias consecutivos respondendo.
- **Ranking:** pódio animado (top 3 com ouro/prata/bronze), lista com posição, avatar, XP; destaque do usuário atual ("você").
- **Avatares:** geração de avatar (ex.: DiceBear) + seleção de cor/tema.
- **Recompensas sociais:** título no perfil, moldura de avatar por posição.

### 7.5 Componentes-chave (design system próprio)
- **Base:** shadcn/ui customizado com tokens neon.
- `NeonButton` (CTA chunky com glow), `QuizCard`, `OptionButton` (estados idle/correto/errado/disabled), `TriesIndicator` (3 corações/corações), `PointsCounter` (count-up), `XPBar`, `LevelBadge`, `StreakFlame`, `LeaderboardRow`, `PodiumCard`, `BadgeChip`, `AvatarPicker`, `ConfettiTrigger`, `SuspenseOverlay`.
- **Storybook** (opcional) para catálogo de componentes.

### 7.6 Responsividade & Mobile-first
- Maioria do público usa **celular** → layout mobile-first, botões grandes (área de toque ≥ 44px).
- **Gestos:** swipe entre perguntas, tap para responder.
- **PWA:** instalável, ícone, splash, funcionamento parcial offline (cache do shell) via `next-pwa`/manifest.
- **Haptics:** `navigator.vibrate` em acerto/erro (mobile).
- **Som/efeitos opcionais** com toggle (acessibilidade).

### 7.7 Acessibilidade (a11y)
- Contraste AA, `prefers-reduced-motion` desativa animações pesadas.
- Navegação por teclado e ARIA nos componentes interativos.
- Feedback nunca só por cor (usar ícone/texto junto).
- Legendas/alt em mídias.

### 7.8 Performance de animação
- Animar apenas `transform`/`opacity`; usar `will-change` com cautela.
- `dynamic import` de Lottie/confetti/conquistas (carregar sob demanda).
- Virtualizar listas longas (ranking) se necessário.
- Respeitar bundle enxuto no plano Hobby.

---

## 8. Fases de Implementação

### Fase 0 — Setup
- `create-next-app` (TS, Tailwind, App Router)
- Configurar Prisma + Neon, Vercel Blob, Auth.js
- Design tokens + shadcn base

### Fase 1 — Auth & Conta
- Cadastro (usuário, senha fraca, telefone) + login
- Listagem de grupos + entrar

### Fase 2 — Grupos & Admin
- Criação de grupo, admin
- Gestão de membros, telefones (só admin)
- Conceder/transferir administração do grupo
- Banimentos com justificativa + lista de bloqueados

### Fase 2.5 — Super Admin
- Papel `SUPER_ADMIN` + seed inicial
- Painel global: ver todos os grupos, promover admins de grupo, editar qualquer pergunta

### Fase 3 — Quiz
- CRUD de perguntas/respostas + mídia (upload Vercel Blob e embed YouTube)
- Fluxo de 3 tentativas + pontuação
- Upload via Vercel Blob

### Fase 4 — Gamificação & Polish Visual
- Sistema de XP, níveis, badges, streak (seção 7.4)
- Ranking por grupo com pódio animado e painel de colocação
- Biblioteca de animações (confetti, Lottie, micro-interações)
- Componentes gamificados (XPBar, Podium, BadgeChip, etc.)
- PWA + haptics + sons opcionais
- Acessibilidade (prefers-reduced-motion, ARIA, contraste)

### Fase 5 — Deploy
- Deploy Vercel, variáveis de ambiente, migrations em produção
- Seed inicial: super admin + badges padrão
- Configurar domínio, monitor de uso (Blob/Neon)

---

## 9. Variáveis de Ambiente
```
DATABASE_URL            # Neon pooled
DIRECT_URL              # Neon direct (migrations)
AUTH_SECRET
BLOB_READ_WRITE_TOKEN   # Vercel Blob
```

---

## 9.1 Limites das Ferramentas Gratuitas

> Valores de referência (planos Free/Hobby), podendo mudar — conferir antes de escalar.

### Vercel (plano Hobby)
| Recurso | Limite Free (Hobby) |
|---|---|
| Projetos | 200 |
| Deployments/dia | 100 (100/hora, 60 a cada 5 min) |
| Build time por deployment | 45 min |
| Upload de arquivos estáticos (CLI) | 100 MB |
| Timeout de requisição (proxy) | 120 s |
| Vercel Functions — duração máx. | 300 s (5 min) |
| Vercel Functions — memória/CPU | 2 GB / 1 vCPU |
| Runtime logs retidos | 1 hora |
| Bandwidth (Fast Data Transfer) | 100 GB/mês (compartilhado entre serviços) |
| Environment variables | 1000 por ambiente; 64 KB no total |

### Vercel Blob (plano Hobby)
| Recurso | Limite Free (Hobby) |
|---|---|
| Storage | **1 GB/mês** |
| Simple Operations | primeiros **10.000** |
| Advanced Operations (upload/copy/list) | primeiros **2.000** |
| Data Transfer | primeiros **10 GB** |
| Tamanho máximo de cache por blob | 512 MB (acima disso = sempre cache MISS) |
| Tamanho máximo de arquivo | 5 TB (usar multipart acima de 100 MB) |
| Rate limit — Simple Ops | 1.200/min (20/s) |
| Rate limit — Advanced Ops | 900/min (15/s) |
| Uploads/dia (API) | 5.000 |

> **Atenção Hobby:** ao estourar o limite do Blob, o acesso é **bloqueado por 30 dias** (não há cobrança adicional). Limites de Blob são **compartilhados** entre todos os serviços Vercel do projeto.
> **Implicação:** 1 GB de storage é pouco para vídeo próprio → **preferir YouTube embed** para vídeos; reservar upload para imagens e vídeos curtos.

### Neon (plano Free)
| Recurso | Limite Free |
|---|---|
| Computação | 100 CU-hours/projeto |
| Autoscaling | até 2 CU (8 GB RAM) |
| Scale to zero | após 5 min de inatividade (não desativável) |
| Storage Postgres | **1 GB/projeto** e **20 GB/conta total** |
| Branches | 10 por projeto; 100 projetos |
| Histórico (instant restore) | 6 horas (limite de 1 GB) |
| Snapshots manuais | 1 |
| Egress de rede pública | 5 GB/projeto incluído |
| Auth (MAU) | até 60.000 MAU/projeto |
| Object Storage | 5 GB/projeto incluído |

> **Comportamento ao estourar:** esgotar CU-hours ou egress suspende a compute até o próximo ciclo; exceder 1 GB de storage bloqueia **escritas** (dados não são apagados). Auth.js (JWT em cookie) não consome MAU do Neon.

### Auth.js (NextAuth v5)
- **Open source, sem custo** (self-hosted na Vercel).
- Usando **Credentials Provider** + sessão JWT, não há limite de MAU nem dependência de serviço externo.
- Hash de senha com `bcryptjs` (puro JS) para não depender de binários nativos em serverless.

### Domínio / SSL
- Domínio `*.vercel.app` gratuito; SSL automático. Domínio próprio é opcional (custo à parte).

### Resumo de riscos por limite
| Risco | Mitigação |
|---|---|
| Blob storage 1 GB estourar | Usar YouTube embed p/ vídeos; upload só p/ imagens/curtos; limitar 5 MB/imagem |
| Blob bloqueado 30 dias por excesso | Monitorar uso; evitar vídeos hospedados |
| Neon 1 GB storage | Texture leve; índice só onde necessário; monitorar |
| Neon suspende compute (scale to zero) | Aceitável (cold start ~segundos); reconectar via pooled URL |
| Deployments 100/dia | Suficiente p/ equipe pequena; agrupar commits |
| Functions timeout 300 s | Upload de mídia via **client upload** direto para o Blob (não passar pela Function) |

---

## 10. Riscos & Observações
- **Segurança do telefone**: nunca expor em payload do cliente p/ não-admin (filtrar no server).
- **Autorização por papel**: validar no server toda ação — `SUPER_ADMIN` (global), admin do grupo (via `Group.adminId`) e usuário comum.
- "Senha fraca": aceitar senhas simples conforme pedido, mas sempre armazenar com hash.
- **Anti-cheat do quiz**: validar tentativas, corretude e pontuação **exclusivamente no server**; nunca enviar `isCorrect` ao cliente antes da resposta. `Attempt` com `@@unique([userId, questionId])` impede duplicação.
- **Mídia pesada**: limitar tamanho/tipo no upload (ex.: imagens ≤ 5MB, vídeos próprios ≤ 50MB); vídeos longos preferir YouTube embed.
- **Free tier**: monitorar limites de Neon/Vercel Blob; vídeos grandes podem estourar cota → usar YouTube embed.
- **Concorrência de tentativas**: validar tentativas no server (não confiar no cliente); usar transação para atualizar `Attempt` + `score`.
- **Super Admin inicial**: criado via script de seed com credenciais em variável de ambiente.
- **Upload seguro**: validar MIME/tipo no server, usar client upload do Blob, e sanitizar URL de YouTube (whitelist de domínio).
- **Ranking consistente**: recalcular `GroupMember.score` a partir dos `Attempt` (fonte da verdade) para evitar divergências.
- **Acessibilidade**: garantir `prefers-reduced-motion`, contraste AA e feedback não só por cor.
- **Bots/abuso de cadastro**: considerar rate limit simples e validação de telefone (mesmo que leve).
