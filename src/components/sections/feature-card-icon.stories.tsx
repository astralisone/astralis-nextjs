import type { Meta, StoryObj } from "@storybook/react";
import { FeatureCardIcon } from "./feature-card-icon";
import { Target, Settings, Zap, TrendingUp } from "lucide-react";

const meta = {
  title: "Sections/FeatureCardIcon",
  component: FeatureCardIcon,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FeatureCardIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LightVariant: Story = {
  args: {
    icon: Target,
    title: "Sales & Marketing Optimization",
    description: "Let your business scale faster with AI-driven solutions",
    variant: "light",
  },
};

export const DarkVariant: Story = {
  args: {
    icon: Zap,
    title: "AI Automation",
    description: "Streamline workflows and boost productivity",
    variant: "dark",
  },
};

export const WithClick: Story = {
  args: {
    icon: Settings,
    title: "Operations & Efficiency",
    description: "Optimize your business processes with intelligent tools",
    variant: "light",
    onClick: () => alert("Feature clicked!"),
  },
};

export const NoHover: Story = {
  args: {
    icon: TrendingUp,
    title: "Financial Intelligence",
    description: "Make data-driven decisions with predictive analytics",
    variant: "light",
    enableHover: false,
  },
};

export const ShortDescription: Story = {
  args: {
    icon: Zap,
    title: "Quick Setup",
    description: "Get started in minutes",
    variant: "light",
  },
};

export const LongDescription: Story = {
  args: {
    icon: Target,
    title: "Comprehensive Analytics",
    description:
      "Gain deep insights into your business performance with our advanced analytics platform that tracks every metric that matters to your success",
    variant: "light",
  },
};

// Grid example
export const GridLayout: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <FeatureCardIcon
        icon={Target}
        title="Sales & Marketing"
        description="Scale faster with AI-driven solutions"
        variant="light"
      />
      <FeatureCardIcon
        icon={Settings}
        title="Operations & Efficiency"
        description="Optimize business processes"
        variant="light"
      />
      <FeatureCardIcon
        icon={Zap}
        title="AI Automation"
        description="Streamline workflows"
        variant="light"
      />
      <FeatureCardIcon
        icon={TrendingUp}
        title="Financial Intelligence"
        description="Data-driven decisions"
        variant="light"
      />
    </div>
  ),
};
