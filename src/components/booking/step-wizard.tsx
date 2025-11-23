"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, X } from "lucide-react";

/**
 * StepWizard Component
 *
 * Multi-step wizard with radio button selection interface.
 * Extracted from reference images showing "Step 1 of 3: Select Topic".
 *
 * Visual Specifications:
 * - White modal/card with rounded corners
 * - Header showing "Step X of Y: Title"
 * - Radio button options in rounded rectangles
 * - Each option: icon + label
 * - Options have border, active state has cyan border + background tint
 * - Close button (X) top-right
 * - Hover effects on options
 *
 * @example
 * ```tsx
 * <StepWizard
 *   currentStep={1}
 *   totalSteps={3}
 *   title="Select Topic"
 *   options={[
 *     { icon: Zap, label: "AI Automation & Efficiency", value: "ai" },
 *     { icon: Code, label: "Custom Development", value: "dev" }
 *   ]}
 *   onSelect={(value) => console.log(value)}
 *   onClose={() => {}}
 * />
 * ```
 */

export interface WizardOption {
  /** Icon component */
  icon: LucideIcon;
  /** Option label */
  label: string;
  /** Option value */
  value: string;
  /** Optional description */
  description?: string;
}

export interface StepWizardProps {
  /** Current step number (1-based) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Step title */
  title: string;
  /** Step description */
  description?: string;
  /** Available options */
  options: WizardOption[];
  /** Selected option value */
  selectedValue?: string;
  /** Selection handler */
  onSelect: (value: string) => void;
  /** Close handler */
  onClose?: () => void;
  /** Show close button */
  showClose?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const StepWizard = React.forwardRef<HTMLDivElement, StepWizardProps>(
  (
    {
      currentStep,
      totalSteps,
      title,
      description,
      options,
      selectedValue,
      onSelect,
      onClose,
      showClose = true,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden",
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-astralis-navy to-astralis-blue text-white p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium opacity-90 mb-2">
                Step {currentStep} of {totalSteps}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
              {description && (
                <p className="text-sm md:text-base opacity-90 mt-2">
                  {description}
                </p>
              )}
            </div>

            {/* Close button */}
            {showClose && onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-6 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-astralis-cyan transition-all duration-500 shadow-glow-cyan"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Options */}
        <div className="p-6 md:p-8 space-y-4">
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedValue === option.value;

            return (
              <button
                key={option.value}
                onClick={() => onSelect(option.value)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 md:p-6 rounded-xl border-2 transition-all duration-300 text-left",
                  isSelected
                    ? "border-astralis-cyan bg-astralis-cyan/5 shadow-md"
                    : "border-slate-200 hover:border-astralis-blue/50 hover:bg-slate-50",
                  "hover:scale-[1.02] hover:shadow-lg"
                )}
              >
                {/* Icon container */}
                <div
                  className={cn(
                    "flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isSelected
                      ? "bg-astralis-cyan border-astralis-cyan text-white shadow-glow-cyan"
                      : "bg-astralis-blue/10 border-astralis-blue text-astralis-blue"
                  )}
                >
                  <Icon className="w-7 h-7" />
                </div>

                {/* Label and description */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={cn(
                      "text-lg md:text-xl font-bold mb-1",
                      isSelected ? "text-astralis-cyan" : "text-astralis-navy"
                    )}
                  >
                    {option.label}
                  </h3>
                  {option.description && (
                    <p className="text-sm text-slate-600">{option.description}</p>
                  )}
                </div>

                {/* Radio indicator */}
                <div
                  className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center",
                    isSelected
                      ? "border-astralis-cyan bg-astralis-cyan"
                      : "border-slate-300"
                  )}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

StepWizard.displayName = "StepWizard";
