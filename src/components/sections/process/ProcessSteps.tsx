'use client';

import { motion } from 'framer-motion';
import { Search, Palette, Rocket, TrendingUp, CheckCircle, Users, Target, Zap } from 'lucide-react';

export function ProcessSteps() {
  const steps = [
    {
      number: '01',
      title: 'Discovery & Strategy',
      description: 'We begin by deeply understanding your business, goals, and challenges. Through comprehensive analysis and stakeholder interviews, we identify opportunities for AI automation and create a tailored strategy.',
      duration: '1-2 weeks',
      icon: Search,
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&q=80',
      deliverables: [
        'Business analysis & competitive research',
        'Stakeholder interviews & requirements gathering',
        'Strategic roadmap & project timeline',
        'Technology stack recommendations'
      ],
      color: 'from-purple-500 to-blue-500'
    },
    {
      number: '02',
      title: 'Design & Development',
      description: 'Our expert team brings your vision to life with stunning designs and robust development. We build scalable, high-performance solutions using cutting-edge technologies and best practices.',
      duration: '3-6 weeks',
      icon: Palette,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&q=80',
      deliverables: [
        'UI/UX design & prototyping',
        'Agile development with weekly sprints',
        'Quality assurance & testing',
        'Integration with existing systems'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      number: '03',
      title: 'Launch & Optimize',
      description: 'We carefully deploy your solution with minimal disruption, monitoring every aspect to ensure smooth operation. Post-launch optimization ensures peak performance and user satisfaction.',
      duration: '1-2 weeks',
      icon: Rocket,
      image: 'https://images.unsplash.com/photo-1�98-c0dc9-ce33b0-fc0f3e7e2ef6?w=800&h=600&fit=crop&q=80',
      deliverables: [
        'Staged deployment & rollout',
        'Team training & documentation',
        'Performance monitoring & analytics',
        'Initial optimization & refinement'
      ],
      color: 'from-cyan-500 to-green-500'
    },
    {
      number: '04',
      title: 'Growth & Support',
      description: 'Our partnership doesn\'t end at launch. We provide ongoing support, maintenance, and strategic guidance to help you scale and evolve with changing business needs.',
      duration: 'Ongoing',
      icon: TrendingUp,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80',
      deliverables: [
        'Proactive monitoring & maintenance',
        'Regular updates & improvements',
        'Strategic growth consulting',
        'Priority support & SLA guarantees'
      ],
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-background via-surface to-background relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:50px_50px] opacity-30"></div>

      <div className="container relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Our <span className="gradient-text">Four-Phase</span> Process
          </h2>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            Each phase is carefully designed to ensure your project's success,
            with clear milestones, deliverables, and continuous communication.
          </p>
        </motion.div>

        <div className="space-y-32">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-dense' : ''
              }`}
            >
              {/* Image */}
              <div className={`relative ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                <div className="relative rounded-2xl overflow-hidden glass-elevated shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 mix-blend-overlay"></div>
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-[400px] object-cover"
                  />
                  {/* Overlay badge */}
                  <div className="absolute top-6 left-6">
                    <div className={`glass-elevated px-6 py-3 rounded-xl border border-white/20 bg-gradient-to-r ${step.color} bg-clip-border`}>
                      <span className="text-2xl font-bold text-white">{step.number}</span>
                    </div>
                  </div>
                </div>

                {/* Decorative element */}
                <div className={`absolute -z-10 inset-0 bg-gradient-to-r ${step.color} blur-3xl opacity-20 rounded-2xl`}></div>
              </div>

              {/* Content */}
              <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl glass-elevated flex items-center justify-center bg-gradient-to-br ${step.color}`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold">{step.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                      <span className="text-sm text-neutral-400">{step.duration}</span>
                    </div>
                  </div>
                </div>

                <p className="text-lg text-neutral-300 mb-8 leading-relaxed">
                  {step.description}
                </p>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
                    Key Deliverables
                  </h4>
                  {step.deliverables.map((deliverable, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-neutral-300">{deliverable}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
