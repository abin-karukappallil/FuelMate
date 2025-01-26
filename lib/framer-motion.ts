import type { Variants } from "framer-motion"

export const fadeIn: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export const scaleIn: Variants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
}

export const slideIn: Variants = {
  initial: { x: -50, opacity: 0 },
  animate: { x: 0, opacity: 1 },
}

