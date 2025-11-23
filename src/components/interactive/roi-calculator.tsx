"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * ROICalculator Component
 *
 * Interactive ROI calculator with sliders and real-time bar chart visualization.
 * Extracted from reference images showing "Find Your Solution in 60 Seconds".
 *
 * Visual Specifications:
 * - White card with light border
 * - Title and description
 * - Interactive slider inputs with labels
 * - Real-time calculated value (large, cyan color)
 * - Bar chart showing comparison
 * - Clean, modern design
 *
 * @example
 * ```tsx
 * <ROICalculator
 *   title="ROI Calculator"
 *   inputs={[
 *     { label: "Avg Ticket Size", type: "slider", min: 0, max: 10000, step: 100 }
 *   ]}
 *   onCalculate={(result) => console.log(result)}
 * />
 * ```
 */

export interface CalculatorInput {
  /** Input label */
  label: string;
  /** Input type */
  type: "slider" | "number";
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Default value */
  defaultValue?: number;
  /** Unit suffix (e.g., "$", "%", "hrs") */
  unit?: string;
}

export interface ROICalculatorProps {
  /** Calculator title */
  title: string;
  /** Description text */
  description?: string;
  /** Input fields */
  inputs: CalculatorInput[];
  /** Calculation handler - receives input values and returns result */
  onCalculate: (values: Record<string, number>) => number;
  /** Result label */
  resultLabel?: string;
  /** Show comparison chart */
  showChart?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const ROICalculator = React.forwardRef<HTMLDivElement, ROICalculatorProps>(
  (
    {
      title,
      description,
      inputs,
      onCalculate,
      resultLabel = "Estimated ROI",
      showChart = true,
      className,
      ...props
    },
    ref
  ) => {
    const [values, setValues] = React.useState<Record<string, number>>(() => {
      const initialValues: Record<string, number> = {};
      inputs.forEach((input, index) => {
        initialValues[`input_${index}`] = input.defaultValue || input.min || 0;
      });
      return initialValues;
    });

    const result = React.useMemo(() => {
      return onCalculate(values);
    }, [values, onCalculate]);

    const handleValueChange = (key: string, value: number) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-xl border-2 border-slate-200 p-8 shadow-card hover:shadow-card-hover transition-shadow duration-300",
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-astralis-navy mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-slate-600 text-sm md:text-base">{description}</p>
          )}
        </div>

        {/* Inputs */}
        <div className="space-y-6 mb-8">
          {inputs.map((input, index) => {
            const key = `input_${index}`;
            const value = values[key];

            return (
              <div key={key} className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700">
                  {input.label}
                </Label>

                {input.type === "slider" ? (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={input.min || 0}
                      max={input.max || 100}
                      step={input.step || 1}
                      value={value}
                      onChange={(e) =>
                        handleValueChange(key, parseFloat(e.target.value))
                      }
                      className={cn(
                        "w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer",
                        "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5",
                        "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-astralis-cyan",
                        "[&::-webkit-slider-thumb]:shadow-glow-cyan [&::-webkit-slider-thumb]:cursor-pointer",
                        "[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full",
                        "[&::-moz-range-thumb]:bg-astralis-cyan [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                      )}
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        {input.min}
                        {input.unit}
                      </span>
                      <span className="text-lg font-bold text-astralis-cyan">
                        {value.toLocaleString()}
                        {input.unit}
                      </span>
                      <span className="text-slate-500">
                        {input.max}
                        {input.unit}
                      </span>
                    </div>
                  </div>
                ) : (
                  <Input
                    type="number"
                    min={input.min}
                    max={input.max}
                    step={input.step}
                    value={value}
                    onChange={(e) =>
                      handleValueChange(key, parseFloat(e.target.value) || 0)
                    }
                    className="text-lg"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Result */}
        <div className="bg-gradient-to-r from-astralis-cyan/10 to-astralis-blue/10 rounded-lg p-6 mb-6">
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-600 mb-2">
              {resultLabel}
            </p>
            <p className="text-5xl md:text-6xl font-bold text-astralis-cyan">
              {result.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Bar chart visualization */}
        {showChart && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-700">
              Comparison
            </h4>
            <div className="flex items-end gap-4 h-48">
              {/* Before bar */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-slate-200 rounded-t-lg relative flex-1 flex items-end">
                  <div
                    className="w-full bg-slate-400 rounded-t-lg transition-all duration-500"
                    style={{ height: "40%" }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-600">Before</span>
              </div>

              {/* After bar */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-slate-200 rounded-t-lg relative flex-1 flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-astralis-cyan to-astralis-blue rounded-t-lg transition-all duration-500 shadow-glow-cyan"
                    style={{ height: "100%" }}
                  />
                </div>
                <span className="text-sm font-medium text-astralis-cyan">
                  After
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

ROICalculator.displayName = "ROICalculator";
