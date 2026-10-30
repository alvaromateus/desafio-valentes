"use client";

import confetti from "canvas-confetti";

export function fireConfetti() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#7C3AED", "#22D3EE", "#EC4899", "#A3E635"],
  });
}
