/**
 * Animation Hooks
 *
 * Custom React hooks for animations, transitions, and interactive effects.
 * All hooks respect prefers-reduced-motion.
 */

export { useCountUp } from './useCountUp';
export type { UseCountUpOptions } from './useCountUp';

export { useStepTransition } from './useStepTransition';
export type {
  UseStepTransitionOptions,
  UseStepTransitionReturn,
} from './useStepTransition';

export {
  useIntersectionAnimation,
  useStaggerAnimation,
} from './useIntersectionAnimation';
export type {
  UseIntersectionAnimationOptions,
  UseIntersectionAnimationReturn,
} from './useIntersectionAnimation';

export { useHoverGlow } from './useHoverGlow';
export type { UseHoverGlowOptions, UseHoverGlowReturn } from './useHoverGlow';
