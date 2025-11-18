/**
 * Contact Page - Astralis Specification Section 4.7
 *
 * Structure:
 * 1. Hero Section - Contact headline
 * 2. Contact Form - 5 fields (Name, Email, Company, Subject, Message)
 * 3. Sidebar Contact Info - Direct email & scheduling links
 *
 * Design:
 * - Light theme with white backgrounds
 * - Two-column layout: Form (left) + Contact info (right)
 * - Astralis Blue accents
 */

import Image from 'next/image';
import { Hero } from '@/components/sections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Calendar, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <Hero
        headline="Let's Build Smarter Systems, Together"
        description="Ready to transform your operations? Schedule a consultation or reach out directly."
        variant="dark"
        className="bg-astralis-navy"
        textAlign="center"
        textColumnWidth="two-thirds"
      />

      {/* Contact Section */}
      <section className="w-full px-6 py-20 md:px-12 md:py-24 lg:px-20 lg:py-32 bg-white relative overflow-hidden">
        {/* Background Image with Subtle Overlay */}
        <div className="absolute inset-0 opacity-3">
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80"
            alt="Team collaboration"
            fill
            className="object-cover"
          />
        </div>

        <div className="mx-auto max-w-[1280px] relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Column: Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-slate-200 rounded-lg shadow-md p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-astralis-navy mb-4">
                  Send us a message
                </h2>
                <p className="text-base text-slate-600 mb-8 leading-relaxed">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>

                <form className="space-y-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Smith"
                      required
                      className="bg-white border-slate-300"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@company.com"
                      required
                      className="bg-white border-slate-300"
                    />
                  </div>

                  {/* Company Field */}
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-slate-700">
                      Company
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Acme Corp"
                      className="bg-white border-slate-300"
                    />
                  </div>

                  {/* Subject Field */}
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-slate-700">
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="How can we help?"
                      required
                      className="bg-white border-slate-300"
                    />
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-slate-700">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us about your project or question..."
                      rows={6}
                      required
                      className="bg-white border-slate-300"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto min-w-[200px]"
                  >
                    Send Message
                  </Button>
                </form>
              </div>
            </div>

            {/* Right Column: Contact Information */}
            <div className="space-y-6 md:space-y-8">
              {/* Direct Contact Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 md:p-8">
                <h3 className="text-xl font-semibold text-astralis-navy mb-6">
                  Direct Contact
                </h3>

                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-astralis-blue flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Email</p>
                      <a
                        href="mailto:hello@astralis.com"
                        className="text-astralis-blue hover:underline"
                      >
                        hello@astralis.com
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-astralis-blue flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Phone</p>
                      <a
                        href="tel:+15551234567"
                        className="text-astralis-blue hover:underline"
                      >
                        +1 (555) 123-4567
                      </a>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-astralis-blue flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Location</p>
                      <p className="text-slate-600">
                        Remote-first operations
                        <br />
                        Serving clients globally
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Card */}
              <div className="bg-gradient-to-br from-astralis-blue to-blue-600 rounded-lg p-6 md:p-8 text-white">
                <Calendar className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-semibold mb-3">
                  Schedule a Consultation
                </h3>
                <p className="text-blue-100 text-base mb-6 leading-relaxed">
                  Book a free 30-minute call to discuss your automation needs.
                </p>
                <Button
                  variant="secondary"
                  size="default"
                  className="w-full bg-white text-astralis-blue hover:bg-slate-100 border-0"
                  asChild
                >
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    Book a Call
                  </a>
                </Button>
              </div>

              {/* Response Time */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <p className="text-base text-slate-600 leading-relaxed">
                  <span className="font-semibold text-astralis-navy">Response time:</span> We typically respond within 24 hours during business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}