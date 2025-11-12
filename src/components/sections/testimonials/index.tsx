"use client"

import { TestimonialCard } from "./testimonial-card"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CEO at TechStart",
    content: "Working with Nicol has been transformative for our brand. Their attention to detail and creative solutions exceeded our expectations.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
  },
  {
    name: "Michael Chen",
    role: "Marketing Director",
    content: "The team's expertise in digital marketing helped us achieve record-breaking growth. Highly recommended!",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
  },
  {
    name: "Emily Davis",
    role: "Product Manager",
    content: "Their innovative approach to problem-solving and dedication to quality makes them stand out from the competition.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
  },
]

export function TestimonialsSection() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Don't just take our word for it - hear from some of our satisfied clients.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={testimonial.name} {...testimonial} index={index} />
        ))}
      </div>
    </section>
  )
}