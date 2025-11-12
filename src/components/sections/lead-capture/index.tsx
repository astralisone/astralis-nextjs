"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, Download, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useState } from "react"

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'E-commerce',
  'Marketing',
  'Finance',
  'Manufacturing',
  'Education',
  'Other'
]

const BUSINESS_SIZES = [
  'Solo (1)',
  'Small (2-10)',
  'Medium (11-50)', 
  'Large (50+)'
]

const CURRENT_TOOLS = [
  'Email (Gmail, Outlook)',
  'Spreadsheets (Excel, Google Sheets)',
  'Project Management (Asana, Trello)',
  'CRM (Salesforce, HubSpot)',
  'Social Media Management',
  'Accounting Software',
  'Design Tools (Photoshop, Canva)',
  'Communication (Slack, Teams)',
  'Website/E-commerce Platform',
  'Other'
]

const PAIN_POINTS = [
  'Too much manual data entry',
  'Repetitive email responses',
  'Tracking leads and follow-ups',
  'Social media content creation',
  'Invoice and payment processing',
  'Scheduling and calendar management',
  'Report generation',
  'Customer service responses',
  'File organization',
  'Other repetitive tasks'
]

export function LeadCaptureSection() {
  const [formData, setFormData] = useState({
    email: "",
    company: "",
    industry: "",
    businessSize: "",
    currentTools: [] as string[],
    painPoints: [] as string[]
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch('/api/reports/ai-optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        // Reset form
        setFormData({
          email: "",
          company: "",
          industry: "",
          businessSize: "",
          currentTools: [],
          painPoints: []
        })
      } else {
        setError(result.error || 'Failed to send report. Please try again.')
      }
    } catch (err) {
      console.error('Submission error:', err)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToolToggle = (tool: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      currentTools: checked 
        ? [...prev.currentTools, tool]
        : prev.currentTools.filter(t => t !== tool)
    }))
  }

  const handlePainPointToggle = (point: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      painPoints: checked 
        ? [...prev.painPoints, point]
        : prev.painPoints.filter(p => p !== point)
    }))
  }

  if (isSubmitted) {
    return (
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <motion.div 
            className="glass-elevated rounded-3xl p-8 max-w-4xl mx-auto text-center border border-green-500/30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">
              Success! Check Your Email
            </h3>
            <p className="text-neutral-300 text-lg">
              Your AI Workflow Optimization Report is on its way. We'll also be in touch within 24 hours to discuss which processes we can automate first.
            </p>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4">
        <motion.div 
          className="glass-elevated rounded-3xl p-8 lg:p-12 max-w-5xl mx-auto text-center relative overflow-hidden border border-purple-500/20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 rounded-3xl" />
          
          {/* Content */}
          <div className="relative">
            {/* Lead magnet icon */}
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600/20 mb-6 mx-auto"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Download className="h-8 w-8 text-purple-400" />
            </motion.div>

            {/* Headline */}
            <h3 className="text-3xl lg:text-4xl font-bold mb-4 gradient-text">
              Get Your Free AI Workflow Optimization Report
            </h3>
            
            {/* Subheading */}
            <p className="text-neutral-300 mb-8 text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
              Discover which tedious tasks you can automate today. Get a personalized plan to save 10+ hours per week with AI-powered workflows.
            </p>

            {/* Value props */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
              <div className="flex items-center gap-3 glass-card rounded-xl p-4 border border-green-500/20">
                <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                <span className="text-white font-medium text-sm">Staff Workflow Analysis</span>
              </div>
              <div className="flex items-center gap-3 glass-card rounded-xl p-4 border border-blue-500/20">
                <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                <span className="text-white font-medium text-sm">Lead Generation AI Plan</span>
              </div>
              <div className="flex items-center gap-3 glass-card rounded-xl p-4 border border-purple-500/20">
                <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                <span className="text-white font-medium text-sm">Automation Roadmap</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="email"
                  placeholder="Your email address *"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-neutral-400 focus:border-purple-400 focus:ring-purple-400/20 h-12 text-base"
                />
                <Input
                  type="text"
                  placeholder="Company name (optional)"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="bg-white/5 border-white/20 text-white placeholder:text-neutral-400 focus:border-purple-400 focus:ring-purple-400/20 h-12 text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white h-12">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-700">
                    {INDUSTRIES.map(industry => (
                      <SelectItem key={industry} value={industry} className="text-white hover:bg-neutral-800">
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={formData.businessSize} onValueChange={(value) => setFormData(prev => ({ ...prev, businessSize: value }))}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white h-12">
                    <SelectValue placeholder="Business size" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-700">
                    {BUSINESS_SIZES.map(size => (
                      <SelectItem key={size} value={size} className="text-white hover:bg-neutral-800">
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Current Tools */}
              <div className="glass-card rounded-xl p-6 border border-white/10">
                <h4 className="text-white font-semibold mb-4">What tools do you currently use?</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CURRENT_TOOLS.map(tool => (
                    <div key={tool} className="flex items-center space-x-3">
                      <Checkbox
                        id={`tool-${tool}`}
                        checked={formData.currentTools.includes(tool)}
                        onCheckedChange={(checked) => handleToolToggle(tool, checked as boolean)}
                        className="border-white/30 data-[state=checked]:bg-purple-600"
                      />
                      <label 
                        htmlFor={`tool-${tool}`}
                        className="text-sm text-neutral-300 cursor-pointer"
                      >
                        {tool}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pain Points */}
              <div className="glass-card rounded-xl p-6 border border-white/10">
                <h4 className="text-white font-semibold mb-4">What are your biggest time-wasters?</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PAIN_POINTS.map(point => (
                    <div key={point} className="flex items-center space-x-3">
                      <Checkbox
                        id={`pain-${point}`}
                        checked={formData.painPoints.includes(point)}
                        onCheckedChange={(checked) => handlePainPointToggle(point, checked as boolean)}
                        className="border-white/30 data-[state=checked]:bg-purple-600"
                      />
                      <label 
                        htmlFor={`pain-${point}`}
                        className="text-sm text-neutral-300 cursor-pointer"
                      >
                        {point}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !formData.email}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 h-14 font-semibold rounded-xl hover:scale-105 transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Generating Your Report...
                  </>
                ) : (
                  <>
                    Get My AI Optimization Report
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Trust indicators */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-neutral-400">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Delivered in 24 hours</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-neutral-600"></div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>No spam, ever</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}