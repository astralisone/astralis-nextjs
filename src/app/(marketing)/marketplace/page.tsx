/**
 * Marketplace Page - Astralis Specification Section 4.5
 *
 * Structure:
 * 1. Hero Section - Dark navy background
 * 2. Category Filter Row - Filter by product type
 * 3. Product Grid - 3 columns, product cards with pricing
 *
 * Products (per spec Section 6):
 * - Enterprise Automation Toolkit
 * - React Enterprise Component Pack
 * - Nx Monorepo Starter
 * - AI Document Console
 * - Agent Blueprint Pack
 *
 * Pricing (per spec Section 7): $29-$299
 *
 * Design:
 * - Light theme with white backgrounds
 * - Hero with dark navy background
 * - 3-column grid on desktop
 * - Dark text on white backgrounds (text-astralis-navy, text-slate-700)
 */

'use client';

import Image from 'next/image';
import { Hero } from '@/components/sections';
import { Button } from '@/components/ui/button';
import { Package, Code, Layers, FileText, Bot, Sparkles, Filter } from 'lucide-react';
import { useState } from 'react';

// Product types
type ProductCategory = 'all' | 'toolkit' | 'components' | 'templates' | 'ai';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  icon: React.ReactNode;
  features: string[];
}

// Marketplace products per spec Section 6
const products: Product[] = [
  {
    id: 'enterprise-automation-toolkit',
    name: 'Complete Automation System',
    description: 'Ready-to-use automation system for your business. Schedule tasks, connect your tools, and monitor everything from one dashboard. Just install and customize for your needs.',
    price: 299,
    category: 'toolkit',
    icon: <Package className="w-8 h-8 text-astralis-blue" />,
    features: ['Workflow Builder', 'Task Scheduling', 'Performance Dashboard', 'Connect Your Apps']
  },
  {
    id: 'react-enterprise-component-pack',
    name: 'Website Building Blocks',
    description: 'Professional website components ready to use. Over 50 pre-built pieces (buttons, forms, menus, etc.) you can customize for your site. Saves months of design work.',
    price: 199,
    category: 'components',
    icon: <Code className="w-8 h-8 text-astralis-blue" />,
    features: ['50+ Ready Components', 'Easy to Customize', 'Full Documentation', 'Accessible Design']
  },
  {
    id: 'nx-monorepo-starter',
    name: 'Multi-App Project Template',
    description: 'Pre-configured project setup for managing multiple applications together. Includes automated testing, deployment tools, and shared code libraries. Save weeks of setup time.',
    price: 149,
    category: 'templates',
    icon: <Layers className="w-8 h-8 text-astralis-blue" />,
    features: ['Multi-App Structure', 'Auto-Deploy Setup', 'Shared Code Libraries', 'Time-Saving Scripts']
  },
  {
    id: 'ai-document-console',
    name: 'Smart Document Organizer',
    description: 'AI-powered system that reads, sorts, and organizes your documents automatically. Upload PDFs or scans and it extracts the information you need.',
    price: 249,
    category: 'ai',
    icon: <FileText className="w-8 h-8 text-astralis-blue" />,
    features: ['Auto-Sort Documents', 'Extract Text & Data', 'Read Scanned Files', 'Export to Your Systems']
  },
  {
    id: 'agent-blueprint-pack',
    name: 'Pre-Built AI Assistants',
    description: 'Ready-made AI helpers for common business tasks. These pre-configured AI assistants can handle customer questions, process data, and automate workflows.',
    price: 279,
    category: 'ai',
    icon: <Bot className="w-8 h-8 text-astralis-blue" />,
    features: ['Q&A Assistants', 'Task Automation', 'Memory & Learning', 'Easy Integration']
  },
  {
    id: 'design-system-starter',
    name: 'Professional Design Kit',
    description: 'Complete design system with color schemes, fonts, and ready-made components. Includes Figma design files so you can customize everything to match your brand.',
    price: 99,
    category: 'components',
    icon: <Sparkles className="w-8 h-8 text-astralis-blue" />,
    features: ['Color & Font System', 'Component Designs', 'Figma Source Files', 'Usage Guidelines']
  },
];

// Categories for filtering
const categories = [
  { id: 'all' as const, label: 'All Products' },
  { id: 'toolkit' as const, label: 'Toolkits' },
  { id: 'components' as const, label: 'Components' },
  { id: 'templates' as const, label: 'Templates' },
  { id: 'ai' as const, label: 'AI & ML' },
];

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');

  // Filter products based on category
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <Hero
        headline="Enterprise-Grade Digital Assets"
        subheadline="Marketplace"
        description="Accelerate your development with production-ready templates, components, and automation tools. Built by experts, validated in production."
        variant="dark"
        className="bg-astralis-navy"
        textAlign="center"
        textColumnWidth="two-thirds"
        primaryButton={{
          text: "Browse All Assets",
          href: "#products"
        }}
      />

      {/* Category Filter Section */}
      <section className="w-full px-6 py-12 md:px-12 lg:px-20 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-5 h-5 text-astralis-blue" />
            <h2 className="text-xl font-semibold text-astralis-navy">Filter by Category</h2>
          </div>

          <div className="flex flex-wrap gap-3 md:gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                  selectedCategory === category.id
                    ? 'bg-astralis-blue text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-astralis-blue hover:text-astralis-blue'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid Section */}
      <section id="products" className="w-full px-6 py-20 md:px-12 md:py-24 lg:px-20 lg:py-32 bg-white relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 opacity-3">
          <Image
            src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1920&q=80"
            alt="Digital marketplace"
            fill
            className="object-cover"
          />
        </div>
        <div className="mx-auto max-w-[1280px] relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-astralis-navy tracking-tight">
              {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.label}
            </h2>
            <p className="text-base md:text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
            </p>
          </div>

          {/* Product Grid - 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-slate-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group"
              >
                {/* Card Content */}
                <div className="p-6 md:p-8">
                  {/* Icon */}
                  <div className="mb-6 flex items-center justify-center w-16 h-16 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors duration-200">
                    {product.icon}
                  </div>

                  {/* Product Name */}
                  <h3 className="text-xl md:text-2xl font-semibold text-astralis-navy mb-3">
                    {product.name}
                  </h3>

                  {/* Description */}
                  <p className="text-base text-slate-700 leading-relaxed mb-6">
                    {product.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-3 mb-6">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-1.5 h-1.5 bg-astralis-blue rounded-full flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Price & CTA */}
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">One-time purchase</p>
                        <p className="text-3xl font-bold text-astralis-navy">
                          ${product.price}
                        </p>
                      </div>
                    </div>

                    {/* Learn More Button */}
                    <Button
                      variant="primary"
                      size="default"
                      className="w-full"
                      asChild
                    >
                      <a href={`/marketplace/${product.id}`}>
                        Learn More
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                No products found
              </h3>
              <p className="text-slate-600 mb-6">
                Try selecting a different category
              </p>
              <Button
                variant="secondary"
                onClick={() => setSelectedCategory('all')}
              >
                View All Products
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-6 py-20 md:px-12 md:py-24 lg:px-20 lg:py-32 bg-gradient-to-br from-astralis-navy to-slate-900">
        <div className="mx-auto max-w-[1280px] text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-6 tracking-tight">
            Need a Custom Solution?
          </h2>
          <p className="text-base md:text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Looking for something specific? We build custom solutions tailored to your enterprise needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              className="bg-white text-astralis-navy hover:bg-slate-100"
              asChild
            >
              <a href="/contact">
                Contact Sales
              </a>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <a href="/process">
                Learn Our Process
              </a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}