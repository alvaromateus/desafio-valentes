import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Mantido para compatibilidade: gera uma URL de avatar (DiceBear) a partir de uma seed.
 */
export function avatarUrl(seed: string, size = 128): string {
  const s = encodeURIComponent(seed || "anon");
  return `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${s}&size=${size}&backgroundType=gradientLinear`;
}

const GRADIENTS = [
  "from-neon-purple to-neon-pink",
  "from-neon-cyan to-neon-purple",
  "from-neon-pink to-neon-amber",
  "from-neon-lime to-neon-cyan",
  "from-neon-amber to-neon-pink",
];

function gradientFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  seed: string;
  emoji?: string | null;
  size?: number;
  ring?: boolean;
}

export function Avatar({ seed, emoji, size = 48, ring, className, ...props }: AvatarProps) {
  const grad = gradientFor(seed || "anon");
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br text-white",
        grad,
        ring && "ring-2 ring-neon-purple",
        className
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      <span style={{ fontSize: size * 0.55, lineHeight: 1 }}>
        {emoji || "😀"}
      </span>
    </div>
  );
}
