"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { LazyImage } from "@/components/ui/lazy-image"

interface PortfolioCardProps {
  title: string
  category: string
  image: string
  index: number
}

export function PortfolioCard({ title, category, image, index }: PortfolioCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="group cursor-pointer overflow-hidden hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20">
        <CardContent className="p-0 relative">
          <div className="relative overflow-hidden aspect-video">
            <LazyImage
              src={image}
              alt={title}
              className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-105"
              placeholderClassName="bg-gradient-to-br from-purple-900/20 to-violet-900/20"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-purple-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Badge className="mb-2">{category}</Badge>
              <h3 className="text-xl font-semibold text-white">{title}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}