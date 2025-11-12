"use client"

import { PortfolioCard } from "./portfolio-card"

const projects = [
  {
    title: "Neon Brand Identity",
    category: "Branding",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
  },
  {
    title: "Tech E-commerce Platform",
    category: "Web Development",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
  },
  {
    title: "Mobile Banking App",
    category: "App Development",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
  },
  {
    title: "Social Media Campaign",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
  },
]

export function PortfolioSection() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Our Work</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore our latest projects and see how we've helped businesses achieve their goals.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <PortfolioCard key={project.title} {...project} index={index} />
        ))}
      </div>
    </section>
  )
}