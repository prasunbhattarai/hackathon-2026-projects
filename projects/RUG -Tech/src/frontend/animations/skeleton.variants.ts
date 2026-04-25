import type { Variants } from 'framer-motion'

export const skeletonVariants: Variants = {
  shimmer: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: { repeat: Infinity, duration: 1.5, ease: 'linear' },
  },
}
