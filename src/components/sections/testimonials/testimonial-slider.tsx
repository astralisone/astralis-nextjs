"use client"

import { motion } from "framer-motion"
import { Carousel, CarouselItem } from "@/components/ui/carousel"
import { TestimonialCard } from "./testimonial-card"
import { useTestimonials } from "@/hooks/useTestimonials"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Fallback testimonials data in case the API fails
const fallbackTestimonials = [
  {
    name: "Sarah Johnson",
    role: "CEO at TechStart",
    content: "Working with Astralis has been transformative for our brand. Their attention to detail and creative solutions exceeded our expectations.",
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

export function TestimonialSlider() {
  const { testimonials, isLoading, error } = useTestimonials({ featured: true });

  // If there's an error, use fallback data
  const displayTestimonials = error || testimonials.length === 0 
    ? fallbackTestimonials 
    : testimonials.map(testimonial => ({
        name: testimonial.author?.name || "Anonymous",
        role: testimonial.role || "",
        content: testimonial.content,
        avatar: testimonial.avatar || testimonial.author?.avatar || "",
      }));

  return (
    <section className="container mx-auto px-4 py-16 bg-neutral-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <motion.div 
        className="text-center mb-16 relative"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          <span className="text-white">What Our </span>
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Clients Say</span>
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto text-lg">
          Don't just take our word for it - hear from some of our satisfied clients who have transformed their businesses with our solutions.
        </p>
      </motion.div>
      
      {error && (
        <Alert variant="destructive" className="mb-6 max-w-4xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            There was an error loading testimonials. Showing sample data instead.
          </AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="max-w-4xl mx-auto relative">
          <Skeleton className="h-[350px] w-full rounded-xl glass-card" />
        </div>
      ) : (
        <div className="relative">
          <Carousel 
            options={{ 
              loop: true,
              align: "center",
              skipSnaps: false,
            }}
            className="max-w-5xl mx-auto"
          >
            {displayTestimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="px-4 md:px-6">
                <TestimonialCard {...testimonial} index={index} />
              </CarouselItem>
            ))}
          </Carousel>
        </div>
      )}
    </section>
  )
} 