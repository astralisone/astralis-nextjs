import type { Meta, StoryObj } from "@storybook/react";
import { ROICalculator } from "./roi-calculator";

const meta = {
  title: "Interactive/ROICalculator",
  component: ROICalculator,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-2xl mx-auto">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ROICalculator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SalesCalculator: Story = {
  args: {
    title: "ROI Calculator",
    description: "See how much you could save with our automation tools",
    inputs: [
      {
        label: "Average Ticket Size (per Opportunity/Sale/Task/Hour)",
        type: "slider",
        min: 0,
        max: 10000,
        step: 100,
        defaultValue: 5000,
        unit: "$",
      },
      {
        label: "Number of Opportunities per Month",
        type: "slider",
        min: 0,
        max: 500,
        step: 10,
        defaultValue: 100,
      },
    ],
    onCalculate: (values) => {
      const ticketSize = values.input_0 || 0;
      const opportunities = values.input_1 || 0;
      return Math.round(ticketSize * opportunities * 0.278); // 278% increase
    },
    resultLabel: "Estimated Monthly ROI",
    showChart: true,
  },
};

export const ProductivityCalculator: Story = {
  args: {
    title: "Find Your Solution in 60 Seconds",
    description: "Calculate your time savings",
    inputs: [
      {
        label: "Hours Spent on Manual Tasks per Week",
        type: "slider",
        min: 0,
        max: 40,
        step: 1,
        defaultValue: 20,
        unit: " hrs",
      },
      {
        label: "Team Size",
        type: "slider",
        min: 1,
        max: 50,
        step: 1,
        defaultValue: 5,
      },
    ],
    onCalculate: (values) => {
      const hours = values.input_0 || 0;
      const teamSize = values.input_1 || 1;
      return Math.round(hours * teamSize * 0.4); // 40% reduction
    },
    resultLabel: "Hours Saved per Week",
    showChart: true,
  },
};

export const WithoutChart: Story = {
  args: {
    ...SalesCalculator.args,
    showChart: false,
  },
};

export const NumberInputs: Story = {
  args: {
    title: "Custom ROI Calculator",
    inputs: [
      {
        label: "Monthly Revenue",
        type: "number",
        min: 0,
        max: 1000000,
        step: 1000,
        defaultValue: 50000,
        unit: "$",
      },
      {
        label: "Expected Growth Rate",
        type: "number",
        min: 0,
        max: 100,
        step: 5,
        defaultValue: 20,
        unit: "%",
      },
    ],
    onCalculate: (values) => {
      const revenue = values.input_0 || 0;
      const growth = values.input_1 || 0;
      return Math.round(revenue * (growth / 100));
    },
    resultLabel: "Projected Monthly Increase",
  },
};
