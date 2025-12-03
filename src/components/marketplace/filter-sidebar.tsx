"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * FilterSidebar Component
 *
 * Sidebar filter component for marketplace/catalog pages.
 * Extracted from reference images showing "The Offers" sidebar.
 *
 * Visual Specifications:
 * - Left sidebar layout
 * - Sections with collapsible headers
 * - Checkbox inputs for filters
 * - Clean typography (slate-600)
 * - Checkbox styling: square, cyan when checked
 * - Section dividers
 * - Minimal, functional design
 *
 * @example
 * ```tsx
 * <FilterSidebar
 *   title="The Offers"
 *   filters={{
 *     category: {
 *       label: "Category",
 *       options: [
 *         { value: "sales", label: "Sales & AI/Strategy" },
 *         { value: "operations", label: "Operations" }
 *       ]
 *     }
 *   }}
 *   selectedFilters={{ category: ["sales"] }}
 *   onFilterChange={(filters) => console.log(filters)}
 * />
 * ```
 */

export interface FilterOption {
  /** Filter value */
  value: string;
  /** Display label */
  label: string;
  /** Number of items (optional) */
  count?: number;
}

export interface FilterSection {
  /** Section label */
  label: string;
  /** Available options */
  options: FilterOption[];
  /** Section is collapsible */
  collapsible?: boolean;
  /** Section is initially collapsed */
  defaultCollapsed?: boolean;
}

export interface FilterSidebarProps {
  /** Sidebar title */
  title?: string;
  /** Filter sections */
  filters: Record<string, FilterSection>;
  /** Currently selected filters */
  selectedFilters?: Record<string, string[]>;
  /** Filter change handler */
  onFilterChange: (filters: Record<string, string[]>) => void;
  /** Additional CSS classes */
  className?: string;
}

export const FilterSidebar = React.forwardRef<HTMLDivElement, FilterSidebarProps>(
  (
    {
      title = "Filters",
      filters,
      selectedFilters = {},
      onFilterChange,
      className,
      ...props
    },
    ref
  ) => {
    const [collapsedSections, setCollapsedSections] = React.useState<
      Record<string, boolean>
    >(() => {
      const initial: Record<string, boolean> = {};
      Object.entries(filters).forEach(([key, section]) => {
        if (section.defaultCollapsed) {
          initial[key] = true;
        }
      });
      return initial;
    });

    const toggleSection = (sectionKey: string) => {
      setCollapsedSections((prev) => ({
        ...prev,
        [sectionKey]: !prev[sectionKey],
      }));
    };

    const handleFilterToggle = (sectionKey: string, optionValue: string) => {
      const currentFilters = selectedFilters[sectionKey] || [];
      const newFilters = currentFilters.includes(optionValue)
        ? currentFilters.filter((v) => v !== optionValue)
        : [...currentFilters, optionValue];

      onFilterChange({
        ...selectedFilters,
        [sectionKey]: newFilters,
      });
    };

    const isFilterSelected = (sectionKey: string, optionValue: string) => {
      return selectedFilters[sectionKey]?.includes(optionValue) || false;
    };

    return (
      <div
        ref={ref}
        className={cn(
          "w-full md:w-64 lg:w-72 bg-white border-r border-slate-200 p-6",
          className
        )}
        {...props}
      >
        {/* Title */}
        {title && (
          <h2 className="text-xl font-bold text-astralis-navy mb-6">{title}</h2>
        )}

        {/* Filter sections */}
        <div className="space-y-6">
          {Object.entries(filters).map(([sectionKey, section]) => {
            const isCollapsed = collapsedSections[sectionKey];

            return (
              <div key={sectionKey} className="border-b border-slate-200 pb-6">
                {/* Section header */}
                <button
                  onClick={() =>
                    section.collapsible !== false && toggleSection(sectionKey)
                  }
                  className="flex items-center justify-between w-full mb-4 group"
                  disabled={section.collapsible === false}
                >
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    {section.label}
                  </h3>
                  {section.collapsible !== false && (
                    <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
                      {isCollapsed ? (
                        <ChevronRight className=" ui-icon w-5 h-5" />
                      ) : (
                        <ChevronDown className=" ui-icon w-5 h-5" />
                      )}
                    </div>
                  )}
                </button>

                {/* Options */}
                {!isCollapsed && (
                  <div className="space-y-3">
                    {section.options.map((option) => {
                      const isSelected = isFilterSelected(
                        sectionKey,
                        option.value
                      );

                      return (
                        <label
                          key={option.value}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          {/* Custom checkbox */}
                          <div className="relative flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                handleFilterToggle(sectionKey, option.value)
                              }
                              className="sr-only peer"
                            />
                            <div
                              className={cn(
                                "w-5 h-5 border-2 rounded transition-all duration-200",
                                isSelected
                                  ? "bg-astralis-cyan border-astralis-cyan"
                                  : "bg-white border-slate-300 group-hover:border-astralis-blue"
                              )}
                            >
                              {isSelected && (
                                <svg
                                  className="w-full h-full text-white"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                >
                                  <path
                                    d="M6 10l2 2 6-6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>

                          {/* Label */}
                          <span className="flex-1 text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                            {option.label}
                          </span>

                          {/* Count badge */}
                          {option.count !== undefined && (
                            <span className="text-xs text-slate-400 font-medium">
                              ({option.count})
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Clear filters button */}
        {Object.values(selectedFilters).some((filters) => filters.length > 0) && (
          <button
            onClick={() => onFilterChange({})}
            className="mt-6 w-full py-2 text-sm font-semibold text-astralis-blue hover:text-astralis-cyan transition-colors duration-200"
          >
            Clear All Filters
          </button>
        )}
      </div>
    );
  }
);

FilterSidebar.displayName = "FilterSidebar";
