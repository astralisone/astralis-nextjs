import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "How long does a typical project take?",
      answer: "Project timelines vary based on scope and complexity. Simple websites typically take a few weeks, while complex applications require more time. We provide detailed timelines during our initial consultation and keep you updated throughout the process."
    },
    {
      question: "What's included in your web development services?",
      answer: "Our comprehensive services include strategy consultation, UI/UX design, front-end and back-end development, CMS integration, SEO optimization, responsive design, testing, deployment, and 3 months of free support and maintenance."
    },
    {
      question: "Do you provide ongoing support after launch?",
      answer: "Yes! We offer various support packages including bug fixes, security updates, content updates, performance monitoring, and feature enhancements. All projects include 3 months of free support, with ongoing maintenance plans available."
    },
    {
      question: "How much does a project typically cost?",
      answer: "Project costs depend on complexity, features, and timeline. We offer competitive pricing for all project sizes, from simple websites to complex applications. We provide detailed, transparent quotes after understanding your specific requirements."
    },
    {
      question: "Can you help improve our existing website?",
      answer: "Absolutely! We offer website audits, performance optimization, redesign services, and ongoing improvements. Whether you need a complete overhaul or specific enhancements, we can help maximize your existing investment."
    },
    {
      question: "What technologies do you work with?",
      answer: "We specialize in modern technologies including React, Next.js, TypeScript, Node.js, PostgreSQL, and various CMS platforms. We stay current with industry best practices and choose the right technology stack for each project's needs."
    },
    {
      question: "Do you work with businesses outside your local area?",
      answer: "Yes! We work with clients globally through our streamlined remote collaboration process. We use modern communication tools and project management systems to ensure seamless collaboration regardless of location."
    },
    {
      question: "What makes Astralis different from other agencies?",
      answer: "Our combination of strategic thinking, technical expertise, and commitment to results sets us apart. We focus on ROI-driven solutions, maintain transparent communication, and provide ongoing optimization to ensure your long-term success."
    }
  ]

  return (
    <section className="py-20 bg-neutral-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Frequently Asked <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Questions</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Get answers to common questions about our services, process, and approach. 
              Can't find what you're looking for? We're here to help.
            </p>
          </motion.div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="glass-card border-white/10 rounded-lg overflow-hidden backdrop-blur-sm"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 text-left bg-white/5 hover:bg-white/10 transition-all duration-200 flex items-center justify-between group"
                >
                  <h3 className="text-lg font-semibold text-white pr-4 group-hover:text-purple-200 transition-colors">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 group-hover:text-purple-300 transition-all duration-200 flex-shrink-0 ${
                      openIndex === index ? "transform rotate-180 text-purple-400" : ""
                    }`}
                  />
                </button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-0 bg-white/5">
                        <p className="text-gray-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12 p-8 glass-elevated rounded-2xl border border-purple-500/20 relative overflow-hidden"
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-2xl"></div>
            
            <div className="relative">
              <h3 className="text-xl font-semibold text-white mb-3">
                Still Have Questions?
              </h3>
              <p className="text-gray-300 mb-6">
                Our team is here to provide personalized answers and discuss your specific needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-purple-500/25">
                  Schedule Free Consultation
                </button>
                <button className="glass-card border border-white/20 hover:border-purple-400/50 text-white hover:text-purple-200 px-6 py-3 rounded-lg font-semibold transition-all duration-200">
                  Email Us Directly
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}