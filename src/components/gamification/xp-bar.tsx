"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { levelTitle, progressToNextLevel } from "@/lib/scoring";

export function XPBar({ points, className }: { points: number; className?: string }) {
  const { level, progress, needed, percent } = progressToNextLevel(points);
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
        <span className="text-gradient">
          Nv. {level} · {levelTitle(level)}
        </span>
        <span className="text-muted-foreground">{progress}/{needed} XP</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
