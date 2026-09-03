"use client";
import { motion } from "framer-motion";

/**
 * Soft atmospheric glows that slowly drift and pulse behind the auth card.
 * Uses only the page-level auth tokens — no new visuals introduced.
 */
export function AuthGlows() {
  return (
    <>
      {/* Top-left glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-accent/20 blur-3xl"
        animate={{
          x: [0, 48, -28, 40, 0],
          y: [0, 32, -24, 20, 0],
          scale: [1, 1.18, 0.9, 1.12, 1],
        }}
        transition={{
          duration: 26,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        }}
      />

      {/* Bottom-right glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-brand-secondary/15 blur-3xl"
        animate={{
          x: [0, -40, 32, -24, 0],
          y: [0, -28, 36, -20, 0],
          scale: [1, 0.9, 1.16, 1.05, 1],
        }}
        transition={{
          duration: 32,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        }}
      />
    </>
  );
}
