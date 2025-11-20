import type { Meta, StoryObj } from "@storybook/react";
import { SolutionCard } from "./solution-card";
import { Zap, TrendingUp, Target, Bot } from "lucide-react";

const meta = {
  title: "Marketplace/SolutionCard",
  component: SolutionCard,
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
} satisfies Meta<typeof SolutionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Featured: Story = {
  args: {
    icon: Zap,
    title: "Predictive Analytics AI",
    rating: 4.5,
    price: "$99/mo",
    description:
      "Forecast customer behavior and optimize your sales pipeline with advanced machine learning algorithms.",
    featured: true,
    onLearnMore: () => alert("Learn more clicked!"),
  },
};

export const Standard: Story = {
  args: {
    icon: TrendingUp,
    title: "Automation Dashboard",
    rating: 4.0,
    price: "$49/mo",
    description: "Streamline your workflows with intelligent automation tools.",
    featured: false,
    onLearnMore: () => alert("Learn more clicked!"),
  },
};

export const HighRating: Story = {
  args: {
    icon: Target,
    title: "Sales Optimizer Pro",
    rating: 5.0,
    price: "$149/mo",
    description: "Premium solution for enterprise sales teams.",
    featured: true,
    badgeText: "Popular",
    onLearnMore: () => alert("Learn more clicked!"),
  },
};

export const WithoutRating: Story = {
  args: {
    icon: Bot,
    title: "AI Assistant",
    price: "Free",
    description: "Get started with our AI-powered assistant tool.",
    onLearnMore: () => alert("Learn more clicked!"),
  },
};

export const LongDescription: Story = {
  args: {
    icon: Zap,
    title: "Enterprise Solution",
    rating: 4.8,
    price: "$299/mo",
    description:
      "This is a very long description that demonstrates how the card handles overflow text. It will be truncated with an ellipsis after three lines to maintain a consistent card height across the grid.",
    featured: true,
    onLearnMore: () => alert("Learn more clicked!"),
  },
};
