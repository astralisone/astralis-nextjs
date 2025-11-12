import type { Meta, StoryObj } from '@storybook/react'
import { TestimonialSlider } from './testimonial-slider'

const meta: Meta<typeof TestimonialSlider> = {
  title: 'Sections/Testimonials/TestimonialSlider',
  component: TestimonialSlider,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TestimonialSlider>

export const Default: Story = {} 