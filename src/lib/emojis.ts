export const GROUP_EMOJIS = [
  '📖','✝️','🙏','🕊️','⛪','🦁','🐑','👑','🌟','🔥',
  '⚔️','🛡️','🎯','🚀','💎','🏆','🎉','🧭','🌍','🌱',
  '🍇','🪨','🏔️','⚓','🌊','☀️','🌙','⭐','💛','❤️',
  '🧡','💚','💙','💜','🤍','📜','🕯️','🎶','🏅','🥇',
];

export const USER_EMOJIS = [
  '😀','😎','🤓','🧐','😇','🤠','🥳','😺','🦊','🐻',
  '🐼','🦁','🐯','🐨','🐸','🐵','🦉','🦅','🐬','🐳',
  '🦄','🐲','🦖','🐢','🐝','🦋','🌟','⚡','🔥','💎',
  '🎯','🚀','👑','🎓','🧠','❤️','✝️','🙏','🎸','🏆',
];

export function randomEmoji(list: string[], seed?: string): string {
  if (seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return list[h % list.length];
  }
  return list[Math.floor(Math.random() * list.length)];
}

/** Emoji aleatorio estavel a partir do username (fallback de cadastro). */
export function defaultUserEmoji(username: string): string {
  return randomEmoji(USER_EMOJIS, username);
}
