import type { Meta, StoryObj } from "@storybook/react";
import { StatsBar } from "./stats-bar";

const meta = {
  title: "Sections/StatsBar",
  component: StatsBar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof StatsBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DarkVariant: Story = {
  args: {
    variant: "dark",
    stats: [
      {
        value: "278%",
        label: "Higher Lead Conversion",
      },
      {
        value: "40%",
        label: "Reduced Cycle by",
      },
      {
        value: "95%",
        label: "Client Success Rate",
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

export const WithSeparators: Story = {
  args: {
    ...DarkVariant.args,
    showSeparators: true,
  },
};

export const WithPrefix: Story = {
  args: {
    variant: "dark",
    stats: [
      {
        prefix: "+",
        value: "500",
        label: "Businesses Transformed",
      },
      {
        prefix: "$",
        value: "2M",
        label: "Revenue Generated",
      },
      {
        value: "4.5",
        label: "Hours Saved Daily",
      },
    ],
  },
};

export const TwoStats: Story = {
  args: {
    variant: "dark",
    stats: [
      {
        value: "99%",
        label: "Uptime Guaranteed",
      },
      {
        value: "24/7",
        label: "Support Available",
      },
    ],
  },
};

export const FourStats: Story = {
  args: {
    variant: "dark",
    showSeparators: true,
    stats: [
      {
        value: "278%",
        label: "Higher Lead Conversion",
      },
      {
        value: "40%",
        label: "Reduced Cycle Time",
      },
      {
        value: "95%",
        label: "Client Success Rate",
      },
      {
        prefix: "+",
        value: "1000",
        label: "Happy Customers",
      },
    ],
  },
};
