export const POINTS_BY_TRY: Record<number, number> = {
  1: 100,
  2: 80,
  3: 50,
};

export const MAX_TRIES = 3;

export const LEVEL_STEP = 500;

export const LEVEL_TITLES = [
  "Novo Discípulo",
  "Estudioso",
  "Pesquisador",
  "Sábio",
  "Mestre",
  "Guardião da Palavra",
  "Lenda",
];

export function pointsForTry(triesUsed: number): number {
  return POINTS_BY_TRY[triesUsed] ?? 0;
}

export function levelFromPoints(points: number): number {
  return Math.max(1, Math.floor(points / LEVEL_STEP) + 1);
}

export function levelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] ?? "Lenda";
}

export function progressToNextLevel(points: number) {
  const level = levelFromPoints(points);
  const currentBase = (level - 1) * LEVEL_STEP;
  const nextBase = level * LEVEL_STEP;
  const progress = points - currentBase;
  return {
    level,
    progress,
    needed: LEVEL_STEP,
    nextLevelAt: nextBase,
    percent: Math.min(100, Math.round((progress / LEVEL_STEP) * 100)),
  };
}

export type BadgeDef = {
  code: string;
  name: string;
  description: string;
  emoji: string;
};

export const BADGE_DEFS: BadgeDef[] = [
  { code: "first_correct", name: "Primeiro Acerto", description: "Acertou sua primeira pergunta", emoji: "⭐" },
  { code: "first_try", name: "De Primeira", description: "Acertou na 1ª tentativa", emoji: "🎯" },
  { code: "perfect_5", name: "Sequência Perfeita", description: "Acertou 5 seguidas", emoji: "🔥" },
  { code: "hundred_club", name: "Clube dos 100", description: "Conquistou 100 pontos", emoji: "💯" },
  { code: "level_5", name: "Nível 5", description: "Alcançou o nível 5", emoji: "🚀" },
  { code: "top1", name: "Líder", description: "Top 1 do ranking de um grupo", emoji: "👑" },
];
