import type { Meta, StoryObj } from "@storybook/react";
import { MarketplaceSearch } from "./marketplace-search";
import { Search, Settings, Zap, TrendingUp, Users, Code, Database, Shield } from "lucide-react";

const meta = {
  title: "Marketplace/MarketplaceSearch",
  component: MarketplaceSearch,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MarketplaceSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSearch: (query) => console.log("Search:", query),
    placeholder: "Search",
    categories: [
      {
        icon: Search,
        label: "Search",
        onClick: () => console.log("Search clicked"),
      },
      {
        icon: Settings,
        label: "Configure",
        onClick: () => console.log("Configure clicked"),
      },
      {
        icon: Zap,
        label: "Automate",
        onClick: () => console.log("Automate clicked"),
      },
      {
        icon: TrendingUp,
        label: "Optimize",
        onClick: () => console.log("Optimize clicked"),
      },
      {
        icon: Users,
        label: "Collaborate",
        onClick: () => console.log("Collaborate clicked"),
      },
      {
        icon: Code,
        label: "Develop",
        onClick: () => console.log("Develop clicked"),
      },
    ],
  },
};

export const ExtendedCategories: Story = {
  args: {
    onSearch: (query) => console.log("Search:", query),
    placeholder: "Search AI solutions...",
    categories: [
      {
        icon: Search,
        label: "Search",
        onClick: () => console.log("Search clicked"),
      },
      {
        icon: Settings,
        label: "Configure",
        onClick: () => console.log("Configure clicked"),
      },
      {
        icon: Zap,
        label: "Automate",
        onClick: () => console.log("Automate clicked"),
      },
      {
        icon: TrendingUp,
        label: "Optimize",
        onClick: () => console.log("Optimize clicked"),
      },
      {
        icon: Users,
        label: "Collaborate",
        onClick: () => console.log("Collaborate clicked"),
      },
      {
        icon: Code,
        label: "Develop",
        onClick: () => console.log("Develop clicked"),
      },
      {
        icon: Database,
        label: "Data",
        onClick: () => console.log("Data clicked"),
      },
      {
        icon: Shield,
        label: "Security",
        onClick: () => console.log("Security clicked"),
      },
    ],
  },
};

export const WithoutConstellation: Story = {
  args: {
    ...Default.args,
    showConstellation: false,
  },
};

export const MinimalCategories: Story = {
  args: {
    onSearch: (query) => console.log("Search:", query),
    placeholder: "What are you looking for?",
    categories: [
      {
        icon: Search,
        label: "Search",
        onClick: () => console.log("Search clicked"),
      },
      {
        icon: Zap,
        label: "AI Tools",
        onClick: () => console.log("AI Tools clicked"),
      },
      {
        icon: Code,
        label: "Development",
        onClick: () => console.log("Development clicked"),
      },
    ],
  },
};

export const NoCategories: Story = {
  args: {
    onSearch: (query) => console.log("Search:", query),
    placeholder: "Search...",
    categories: [],
  },
};
