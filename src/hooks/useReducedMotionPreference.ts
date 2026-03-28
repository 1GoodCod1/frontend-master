import { useReducedMotion } from 'framer-motion';

/**
 * OS / browser «reduce motion» (accessibility + less work on weak GPUs).
 * When true, prefer instant transitions instead of animated ones.
 */
export function useReducedMotionPreference(): boolean {
  return useReducedMotion() === true;
}
