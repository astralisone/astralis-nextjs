'use client';

import { motion } from 'framer-motion';
import { Users, Target, Zap, Shield, BarChart3, Lightbulb } from 'lucide-react';

export function ProcessMethodology() {
  const principles = [
    {
      icon: Users,
      title: 'Client-Centric Approach',
      description: 'Your success is our success. We prioritize understanding your unique business needs and goals.',
      color: 'from-purple-500 to-blue-500'
    },
    {
      icon: Target,
      title: 'Goal-Oriented Planning',
      description: 'Every decision is aligned with your business objectives and measurable KPIs.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: 'Agile Methodology',
      description: 'Flexible, iterative development with regular feedback loops and rapid adjustments.',
      color: 'from-cyan-500 to-green-500'
    },
    {
      icon: Shield,
      title: 'Quality Assurance',
      description: 'Rigorous testing and validation at every stage to ensure reliability and performance.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: BarChart3,
      title: 'Data-Driven Decisions',
      description: 'Leveraging analytics and insights to optimize solutions and drive continuous improvement.',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Lightbulb,
      title: 'Innovation First',
      description: 'Staying ahead with cutting-edge technologies and creative problem-solving.',
      color: 'from-teal-500 to-purple-500'
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=1080&fit=crop&q=80"
          alt="Team working together"
          className="w-full h-full object-cover opacity-5"
        />
      </div>

      <div className="container relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Our <span className="gradient-text">Core Principles</span>
          </h2>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            The foundational values that guide every project we undertake,
            ensuring consistent excellence and client satisfaction.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {principles.map((principle, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="glass-elevated rounded-2xl p-8 border border-white/10 hover:border-primary/30 transition-all duration-300 h-full hover:scale-105">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-br ${principle.color} shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <principle.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {principle.title}
                </h3>
                <p className="text-neutral-300 leading-relaxed">
                  {principle.description}
                </p>

                {/* Decorative gradient */}
                <div className={`mt-6 h-1 w-0 group-hover:w-full bg-gradient-to-r ${principle.color} rounded-full transition-all duration-500`}></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-24 glass-elevated rounded-3xl p-12 border border-white/10"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '98%', label: 'Client Satisfaction' },
              { value: '150+', label: 'Projects Delivered' },
              { value: '24/7', label: 'Support Available' },
              { value: '5x', label: 'Average ROI' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-5xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-neutral-400 text-sm uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
