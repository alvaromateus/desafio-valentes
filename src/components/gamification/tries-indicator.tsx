"use client";

import { motion } from "framer-motion";
import { Heart, HeartCrack } from "lucide-react";

const MAX = 3;

export function TriesIndicator({ triesUsed }: { triesUsed: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Tentativas usadas: ${triesUsed} de ${MAX}`}>
      {Array.from({ length: MAX }).map((_, i) => {
        const used = i < triesUsed;
        return (
          <motion.span
            key={i}
            initial={{ scale: 1 }}
            animate={used ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {used ? (
              <HeartCrack className="h-5 w-5 text-neon-red" />
            ) : (
              <Heart className="h-5 w-5 fill-neon-pink text-neon-pink" />
            )}
          </motion.span>
        );
      })}
    </div>
  );
}
