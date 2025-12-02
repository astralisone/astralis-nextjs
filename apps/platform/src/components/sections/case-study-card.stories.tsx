import type { Meta, StoryObj } from "@storybook/react";
import { CaseStudyCard } from "./case-study-card";

const meta = {
  title: "Sections/CaseStudyCard",
  component: CaseStudyCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CaseStudyCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DarkTech: Story = {
  args: {
    title: "Boosting Manufacturing Output by 40%",
    subtitle: "with Predictive Maintenance AI",
    variant: "dark-tech",
    ctaText: "Read More",
    onClick: () => alert("Case study clicked!"),
  },
};

export const WithDescription: Story = {
  args: {
    title: "Transforming Customer Support with AI",
    subtitle: "Reducing response time by 85%",
    description:
      "Learn how we helped a Fortune 500 company revolutionize their customer support operations using advanced AI chatbots and predictive analytics.",
    variant: "dark-tech",
    onClick: () => alert("Case study clicked!"),
  },
};

export const Gradient: Story = {
  args: {
    title: "Revenue Growth Through AI Automation",
    subtitle: "278% increase in qualified leads",
    variant: "gradient",
    ctaText: "View Case Study",
    onClick: () => alert("Case study clicked!"),
  },
};

export const Light: Story = {
  args: {
    title: "Streamlining Operations",
    subtitle: "Saving 1000+ hours monthly",
    description:
      "Discover how automation transformed this enterprise's workflow efficiency.",
    variant: "light",
    onClick: () => alert("Case study clicked!"),
  },
};

export const WithHref: Story = {
  args: {
    title: "E-commerce Success Story",
    subtitle: "3x conversion rate improvement",
    variant: "dark-tech",
    href: "/case-studies/ecommerce",
    ctaText: "Learn More",
  },
};

export const ShortTitle: Story = {
  args: {
    title: "AI Success",
    subtitle: "Fast implementation",
    variant: "dark-tech",
    onClick: () => alert("Case study clicked!"),
  },
};
