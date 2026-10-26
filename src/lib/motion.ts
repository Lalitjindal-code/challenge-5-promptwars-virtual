import type { Transition, Variants } from "framer-motion";

/**
 * Planora AI Motion Design Tokens
 * Cinematic, refined, purposeful easing and durations.
 */
export const MOTION_EASE = {
  cinematic: [0.16, 1, 0.3, 1] as const, // Smooth editorial deceleration
  snappy: [0.2, 0.8, 0.2, 1] as const,    // Fast tactile UI feedback
  gentle: [0.25, 0.1, 0.25, 1] as const,  // Neutral smooth curve
};

export const MOTION_DURATION = {
  micro: 0.16,
  standard: 0.26,
  reveal: 0.48,
  cinematic: 0.72,
};

export const TRANSITION_STANDARD: Transition = {
  duration: MOTION_DURATION.standard,
  ease: MOTION_EASE.cinematic,
};

export const TRANSITION_MICRO: Transition = {
  duration: MOTION_DURATION.micro,
  ease: MOTION_EASE.snappy,
};

export const TRANSITION_REVEAL: Transition = {
  duration: MOTION_DURATION.reveal,
  ease: MOTION_EASE.cinematic,
};

/**
 * Standard container and item reveal variants
 */
export const containerStaggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITION_REVEAL,
  },
};

export const fadeInScaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: TRANSITION_STANDARD,
  },
};

export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.16 } },
};

export const modalPanelVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: MOTION_EASE.cinematic,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 8,
    transition: {
      duration: 0.18,
      ease: MOTION_EASE.snappy,
    },
  },
};

export const cardHoverVariants: Variants = {
  rest: {
    y: 0,
    boxShadow: "0 1px 3px 0 rgba(17, 27, 46, 0.05)",
    transition: TRANSITION_STANDARD,
  },
  hover: {
    y: -4,
    boxShadow: "0 12px 28px -6px rgba(17, 27, 46, 0.12), 0 4px 10px -2px rgba(115, 87, 219, 0.06)",
    transition: TRANSITION_STANDARD,
  },
};
