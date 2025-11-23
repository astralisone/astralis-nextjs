import type { Meta, StoryObj } from "@storybook/react";
import { StepWizard } from "./step-wizard";
import { Zap, Code, TrendingUp, Target, Users, Settings } from "lucide-react";
import { useState } from "react";

const meta = {
  title: "Booking/StepWizard",
  component: StepWizard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof StepWizard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Step1of3: Story = {
  args: {
    currentStep: 1,
    totalSteps: 3,
    title: "Select Topic",
    description: "Choose the area you'd like to discuss",
    options: [
      {
        icon: Zap,
        label: "AI Automation & Efficiency",
        value: "ai",
        description: "Streamline workflows with intelligent automation",
      },
      {
        icon: Code,
        label: "Custom Development & Digital Products",
        value: "dev",
        description: "Build tailored solutions for your needs",
      },
      {
        icon: TrendingUp,
        label: "Sales & Marketing Solutions",
        value: "sales",
        description: "Optimize your revenue generation",
      },
    ],
    selectedValue: "ai",
    onSelect: (value) => console.log("Selected:", value),
    onClose: () => console.log("Close clicked"),
  },
};

export const Step2of3: Story = {
  args: {
    currentStep: 2,
    totalSteps: 3,
    title: "Select Your Goal",
    description: "What's your primary objective?",
    options: [
      {
        icon: Target,
        label: "Increase Revenue",
        value: "revenue",
      },
      {
        icon: Users,
        label: "Improve Team Efficiency",
        value: "efficiency",
      },
      {
        icon: Settings,
        label: "Reduce Operational Costs",
        value: "costs",
      },
    ],
    selectedValue: "efficiency",
    onSelect: (value) => console.log("Selected:", value),
    onClose: () => console.log("Close clicked"),
  },
};

export const Step3of3: Story = {
  args: {
    currentStep: 3,
    totalSteps: 3,
    title: "Choose Your Timeline",
    options: [
      {
        icon: Zap,
        label: "Immediate (1-2 weeks)",
        value: "immediate",
      },
      {
        icon: TrendingUp,
        label: "Short-term (1-3 months)",
        value: "short",
      },
      {
        icon: Target,
        label: "Long-term (3+ months)",
        value: "long",
      },
    ],
    onSelect: (value) => console.log("Selected:", value),
    onClose: () => console.log("Close clicked"),
  },
};

export const WithoutClose: Story = {
  args: {
    ...Step1of3.args,
    showClose: false,
  },
};

export const NoSelection: Story = {
  args: {
    currentStep: 1,
    totalSteps: 3,
    title: "Select Topic",
    options: [
      {
        icon: Zap,
        label: "AI Automation & Efficiency",
        value: "ai",
      },
      {
        icon: Code,
        label: "Custom Development & Digital Products",
        value: "dev",
      },
      {
        icon: TrendingUp,
        label: "Sales & Marketing Solutions",
        value: "sales",
      },
    ],
    onSelect: (value) => console.log("Selected:", value),
    onClose: () => console.log("Close clicked"),
  },
};

// Interactive example
export const Interactive: Story = {
  args: {
    currentStep: 1,
    totalSteps: 3,
    title: "Select Topic",
    description: "Choose the area you'd like to discuss",
    options: [],
    onSelect: (value) => console.log("Selected:", value),
  },
  render: (args) => {
    const [selectedValue, setSelectedValue] = useState<string>();

    return (
      <StepWizard
        currentStep={1}
        totalSteps={3}
        title="Select Topic"
        description="Choose the area you'd like to discuss"
        options={[
          {
            icon: Zap,
            label: "AI Automation & Efficiency",
            value: "ai",
          },
          {
            icon: Code,
            label: "Custom Development & Digital Products",
            value: "dev",
          },
          {
            icon: TrendingUp,
            label: "Sales & Marketing Solutions",
            value: "sales",
          },
        ]}
        selectedValue={selectedValue}
        onSelect={setSelectedValue}
        onClose={() => console.log("Close clicked")}
      />
    );
  },
};
