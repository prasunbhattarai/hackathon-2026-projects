import type { Variants } from 'framer-motion'

export const cardHoverVariants: Variants = {
  rest: {
    scale: 1,
    borderColor: 'var(--border)',
  },
  hover: {
    scale: 1.002,
    borderColor: 'var(--border-strong)',
    transition: { duration: 0.15 },
  },
}
