import type { Meta, StoryObj } from "@storybook/react";
import { HeroWithTechGraphic } from "./hero-with-graphic";

const meta = {
  title: "Sections/HeroWithTechGraphic",
  component: HeroWithTechGraphic,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HeroWithTechGraphic>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FunnelGraphic: Story = {
  args: {
    title: "AI-Driven Sales Automation: Elevate Conversion, Accelerate Growth",
    subtitle:
      "Transform your sales intelligence with powerful AI-driven solutions and streamline your CRM workflows.",
    primaryCTA: {
      text: "Launch Sales Analyzer Wizard",
      href: "#",
    },
    secondaryCTA: {
      text: "Book a Demo",
      href: "/contact",
    },
    graphicType: "funnel",
  },
};

export const NetworkGraphic: Story = {
  args: {
    title: "Intelligent Solutions for Every Business Challenge",
    subtitle:
      "AI-Powered Solutions for Every Challenge. Build the Future Today.",
    primaryCTA: {
      text: "Explore AI Solutions",
      href: "#",
    },
    secondaryCTA: {
      text: "Book a Strategy Session",
      href: "/contact",
    },
    graphicType: "network",
  },
};

export const AbstractGraphic: Story = {
  args: {
    title: "Automate Your Growth. Intelligent AI Solutions for Modern Enterprises.",
    subtitle:
      "We transform manual workflows into powerful automated systems, increasing efficiency 200%.",
    primaryCTA: {
      text: "Launch the AI Service Wizard",
      href: "#",
    },
    secondaryCTA: {
      text: "Book a Free Strategy Session",
      href: "/contact",
    },
    graphicType: "abstract",
  },
};

export const WithoutParticles: Story = {
  args: {
    ...FunnelGraphic.args,
    showParticles: false,
  },
};

export const SingleCTA: Story = {
  args: {
    title: "Transform Your Business with AI",
    subtitle: "Next-generation automation for modern teams",
    primaryCTA: {
      text: "Get Started",
      href: "#",
    },
    graphicType: "funnel",
  },
};
