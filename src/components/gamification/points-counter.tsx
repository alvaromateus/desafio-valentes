"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

export function PointsCounter({ value, className }: { value: number; className?: string }) {
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [value, mv]);

  return (
    <motion.span className={className} initial={{ scale: 0.6 }} animate={{ scale: 1 }}>
      {display}
    </motion.span>
  );
}
