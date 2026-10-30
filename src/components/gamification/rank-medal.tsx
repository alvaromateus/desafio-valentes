export const RANK_MEDALS = ["🥇", "🥈", "🥉"];
export function rankMedal(pos: number) {
  return RANK_MEDALS[pos - 1] ?? `#${pos}`;
}
