import type { Meta, StoryObj } from "@storybook/react";
import { FilterSidebar } from "./filter-sidebar";
import { useState } from "react";

const meta = {
  title: "Marketplace/FilterSidebar",
  component: FilterSidebar,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FilterSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleFilters = {
  category: {
    label: "Category",
    options: [
      { value: "sales", label: "Sales & AI/Strategy", count: 12 },
      { value: "operations", label: "Operations", count: 8 },
      { value: "finance", label: "Finance & Accounting", count: 6 },
      { value: "hr", label: "HR & Recruiting", count: 4 },
    ],
  },
  integration: {
    label: "Integration",
    options: [
      { value: "api", label: "API", count: 15 },
      { value: "zapier", label: "Zapier", count: 10 },
      { value: "slack", label: "Slack", count: 8 },
      { value: "salesforce", label: "Salesforce", count: 5 },
    ],
  },
  pricing: {
    label: "Pricing",
    options: [
      { value: "free", label: "Free", count: 3 },
      { value: "starter", label: "Starter ($0-$50)", count: 8 },
      { value: "professional", label: "Professional ($50-$200)", count: 12 },
      { value: "enterprise", label: "Enterprise ($200+)", count: 6 },
    ],
  },
};

export const Default: Story = {
  args: {
    title: "The Offers",
    filters: sampleFilters,
    selectedFilters: {},
    onFilterChange: (filters) => console.log("Filters changed:", filters),
  },
};

export const WithSelection: Story = {
  args: {
    title: "Filters",
    filters: sampleFilters,
    selectedFilters: {
      category: ["sales", "operations"],
      pricing: ["professional"],
    },
    onFilterChange: (filters) => console.log("Filters changed:", filters),
  },
};

export const CollapsibleSections: Story = {
  args: {
    title: "Filters",
    filters: {
      category: {
        label: "Category",
        collapsible: true,
        defaultCollapsed: false,
        options: [
          { value: "sales", label: "Sales & AI/Strategy" },
          { value: "operations", label: "Operations" },
        ],
      },
      advanced: {
        label: "Advanced Options",
        collapsible: true,
        defaultCollapsed: true,
        options: [
          { value: "beta", label: "Beta Features" },
          { value: "experimental", label: "Experimental" },
        ],
      },
    },
    selectedFilters: {},
    onFilterChange: (filters) => console.log("Filters changed:", filters),
  },
};

export const WithoutCounts: Story = {
  args: {
    title: "Filter By",
    filters: {
      category: {
        label: "Category",
        options: [
          { value: "sales", label: "Sales & AI/Strategy" },
          { value: "operations", label: "Operations" },
          { value: "finance", label: "Finance & Accounting" },
        ],
      },
      status: {
        label: "Status",
        options: [
          { value: "active", label: "Active" },
          { value: "archived", label: "Archived" },
        ],
      },
    },
    selectedFilters: {},
    onFilterChange: (filters) => console.log("Filters changed:", filters),
  },
};

// Interactive example
export const Interactive: Story = {
  render: () => {
    const [selectedFilters, setSelectedFilters] = useState<
      Record<string, string[]>
    >({});

    return (
      <FilterSidebar
        title="The Offers"
        filters={sampleFilters}
        selectedFilters={selectedFilters}
        onFilterChange={setSelectedFilters}
      />
    );
  },
};
