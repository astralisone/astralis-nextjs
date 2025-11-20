'use client';

import { useState, useCallback } from 'react';

/**
 * useStepTransition Hook - Multi-step navigation with transitions
 *
 * Manages multi-step form/wizard state with slide animations.
 * Matches the step wizard from reference images.
 *
 * Features:
 * - Step navigation (next, prev, goto)
 * - Transition direction tracking
 * - History management
 * - Validation support
 *
 * @example
 * ```tsx
 * const {
 *   currentStep,
 *   direction,
 *   nextStep,
 *   prevStep,
 *   goToStep
 * } = useStepTransition({
 *   totalSteps: 3,
 *   initialStep: 1
 * });
 * ```
 */

export interface UseStepTransitionOptions {
  /** Total number of steps */
  totalSteps: number;
  /** Initial step (1-based) */
  initialStep?: number;
  /** Validation function for each step */
  validateStep?: (step: number) => boolean | Promise<boolean>;
  /** Callback when step changes */
  onStepChange?: (step: number, direction: 'forward' | 'backward') => void;
  /** Allow skipping steps */
  allowSkip?: boolean;
}

export interface UseStepTransitionReturn {
  /** Current step (1-based) */
  currentStep: number;
  /** Transition direction */
  direction: 'forward' | 'backward' | null;
  /** Is first step */
  isFirstStep: boolean;
  /** Is last step */
  isLastStep: boolean;
  /** Go to next step */
  nextStep: () => Promise<boolean>;
  /** Go to previous step */
  prevStep: () => void;
  /** Go to specific step */
  goToStep: (step: number) => Promise<boolean>;
  /** Reset to initial step */
  reset: () => void;
  /** Step history */
  history: number[];
  /** Transition class for CSS animations */
  transitionClass: string;
}

export function useStepTransition({
  totalSteps,
  initialStep = 1,
  validateStep,
  onStepChange,
  allowSkip = false,
}: UseStepTransitionOptions): UseStepTransitionReturn {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [direction, setDirection] = useState<'forward' | 'backward' | null>(null);
  const [history, setHistory] = useState<number[]>([initialStep]);

  // Validation helper
  const validate = async (step: number): Promise<boolean> => {
    if (!validateStep) return true;

    try {
      const isValid = await validateStep(step);
      return isValid;
    } catch (error) {
      console.error('Step validation error:', error);
      return false;
    }
  };

  // Go to next step
  const nextStep = useCallback(async (): Promise<boolean> => {
    if (currentStep >= totalSteps) return false;

    const isValid = await validate(currentStep);
    if (!isValid) return false;

    const nextStepNumber = currentStep + 1;
    setDirection('forward');
    setCurrentStep(nextStepNumber);
    setHistory((prev) => [...prev, nextStepNumber]);

    onStepChange?.(nextStepNumber, 'forward');

    // Clear direction after animation
    setTimeout(() => setDirection(null), 300);

    return true;
  }, [currentStep, totalSteps, onStepChange]);

  // Go to previous step
  const prevStep = useCallback((): void => {
    if (currentStep <= 1) return;

    const prevStepNumber = currentStep - 1;
    setDirection('backward');
    setCurrentStep(prevStepNumber);
    setHistory((prev) => [...prev, prevStepNumber]);

    onStepChange?.(prevStepNumber, 'backward');

    // Clear direction after animation
    setTimeout(() => setDirection(null), 300);
  }, [currentStep, onStepChange]);

  // Go to specific step
  const goToStep = useCallback(
    async (step: number): Promise<boolean> => {
      if (step < 1 || step > totalSteps) return false;
      if (step === currentStep) return true;

      // If not allowing skip, validate all steps in between
      if (!allowSkip && step > currentStep) {
        for (let i = currentStep; i < step; i++) {
          const isValid = await validate(i);
          if (!isValid) return false;
        }
      }

      const newDirection = step > currentStep ? 'forward' : 'backward';
      setDirection(newDirection);
      setCurrentStep(step);
      setHistory((prev) => [...prev, step]);

      onStepChange?.(step, newDirection);

      // Clear direction after animation
      setTimeout(() => setDirection(null), 300);

      return true;
    },
    [currentStep, totalSteps, allowSkip, onStepChange]
  );

  // Reset to initial step
  const reset = useCallback((): void => {
    setCurrentStep(initialStep);
    setDirection(null);
    setHistory([initialStep]);
  }, [initialStep]);

  // Generate transition class
  const transitionClass =
    direction === 'forward'
      ? 'animate-slide-in-right'
      : direction === 'backward'
      ? 'animate-slide-in-left'
      : '';

  return {
    currentStep,
    direction,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
    nextStep,
    prevStep,
    goToStep,
    reset,
    history,
    transitionClass,
  };
}
