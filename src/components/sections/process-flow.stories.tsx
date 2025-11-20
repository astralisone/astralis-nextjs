import type { Meta, StoryObj } from "@storybook/react";
import { ProcessFlow } from "./process-flow";
import { Search, Wrench, Rocket, TrendingUp } from "lucide-react";

const meta = {
  title: "Sections/ProcessFlow",
  component: ProcessFlow,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProcessFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DarkVariant: Story = {
  args: {
    title: "Our Proven Process",
    subtitle: "Ready to Transform Your Business?",
    variant: "dark",
    steps: [
      {
        icon: Search,
        title: "Browse & Strategy",
        description: "Discover opportunities and develop strategic roadmaps",
      },
      {
        icon: Wrench,
        title: "Design & Optimize",
        description: "Create tailored solutions that fit your needs",
      },
      {
        icon: Rocket,
        title: "Build Innovative Solutions",
        description: "Launch powerful AI-driven systems",
      },
      {
        icon: TrendingUp,
        title: "Growth & Support",
        description: "Scale your success with ongoing optimization",
      },
    ],
  },
};

export const LightVariant: Story = {
  args: {
    ...DarkVariant.args,
    variant: "light",
  },
};

export const ThreeSteps: Story = {
  args: {
    title: "Simple 3-Step Process",
    variant: "dark",
    steps: [
      {
        icon: Search,
        title: "Discover",
        description: "Identify your challenges",
      },
      {
        icon: Wrench,
        title: "Design",
        description: "Create the perfect solution",
      },
      {
        icon: Rocket,
        title: "Deploy",
        description: "Launch and scale",
      },
    ],
  },
};

export const WithoutArrows: Story = {
  args: {
    ...DarkVariant.args,
    showArrows: false,
  },
};

export const WithoutGlow: Story = {
  args: {
    ...DarkVariant.args,
    enableGlow: false,
  },
};
