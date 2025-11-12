import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function ProcessSection() {
  const steps = [
    {
      step: "01",
      title: "Discovery & Strategy",
      description: "We analyze your business, competition, and goals to create a winning strategy.",
      icon: "🔍",
      duration: "1-2 weeks"
    },
    {
      step: "02", 
      title: "Design & Development",
      description: "Our team creates stunning designs and builds high-performance solutions.",
      icon: "🎨",
      duration: "3-6 weeks"
    },
    {
      step: "03",
      title: "Launch & Optimize",
      description: "We deploy your solution and continuously optimize for maximum results.",
      icon: "🚀",
      duration: "1-2 weeks"
    },
    {
      step: "04",
      title: "Growth & Support",
      description: "Ongoing maintenance, updates, and growth strategies to scale your success.",
      icon: "📈",
      duration: "Ongoing"
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-neutral-900 via-purple-900/10 to-neutral-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:50px_50px]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Our Proven <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Process</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              From initial consultation to ongoing success, we follow a strategic process 
              that ensures your project delivers maximum impact and ROI.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-purple-500/30 via-purple-400/20 to-transparent z-0"></div>
              )}
              
              <div className="relative glass-elevated rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300 group-hover:shadow-purple-500/10 group-hover:shadow-2xl">
                {/* Step number */}
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-full mb-4 border border-purple-500/30">
                  <span className="text-sm font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{step.step}</span>
                </div>

                {/* Icon */}
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{step.icon}</div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-purple-200 transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-300 mb-4 leading-relaxed group-hover:text-gray-200 transition-colors">
                  {step.description}
                </p>

                {/* Duration */}
                <div className="inline-flex items-center gap-2 text-xs font-medium glass-card px-3 py-2 rounded-full border border-purple-500/20 hover:border-purple-400/40 transition-all">
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-purple-300">{step.duration}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="glass-elevated rounded-2xl p-8 border border-purple-500/20 max-w-2xl mx-auto relative overflow-hidden">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10 rounded-2xl"></div>
            
            <div className="relative">
              <h3 className="text-2xl font-semibold text-white mb-4">
                Ready to Start Your Project?
              </h3>
              <p className="text-gray-300 mb-8 text-lg">
                Let's discuss your goals and create a custom strategy for your business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-purple-500/25 px-8 py-4 text-base font-semibold"
                >
                  Schedule Free Consultation
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="glass-card border-white/20 hover:border-purple-400/50 text-white hover:text-purple-200 px-8 py-4 text-base font-semibold"
                  onClick={() => window.location.href = '/process'}
                >
                  Learn More About Our Process
                </Button>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}