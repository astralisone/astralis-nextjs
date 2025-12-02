'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, FormEvent } from 'react';

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  company?: string;
  subject?: string;
  message?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const validateField = (name: keyof ContactFormData, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        break;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        break;
      case 'subject':
        if (value.trim().length < 3) return 'Subject must be at least 3 characters';
        break;
      case 'message':
        if (value.trim().length < 10) return 'Message must be at least 10 characters';
        break;
    }
    return undefined;
  };

  const handleFieldChange = (name: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
      setSubmitMessage('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const nameError = validateField('name', formData.name);
    if (nameError) newErrors.name = nameError;
    const emailError = validateField('email', formData.email);
    if (emailError) newErrors.email = emailError;
    const subjectError = validateField('subject', formData.subject);
    if (subjectError) newErrors.subject = subjectError;
    const messageError = validateField('message', formData.message);
    if (messageError) newErrors.message = messageError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    // For static export, we'll redirect to the platform contact API
    // In production, this would be handled by the main app API
    try {
      // Simulate submission for static site
      // In production, redirect to https://app.astralisone.com/api/contact
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubmitStatus('success');
      setSubmitMessage("Thank you for contacting us! We&apos;ll get back to you within 24 hours.");
      setFormData({ name: '', email: '', company: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white border-b py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-astralis-navy">
            Astralis One
          </Link>
          <div className="flex gap-6">
            <Link href="/services" className="text-gray-600 hover:text-astralis-blue">
              Services
            </Link>
            <Link href="/solutions" className="text-gray-600 hover:text-astralis-blue">
              Solutions
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-astralis-blue">
              Pricing
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-astralis-blue">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-astralis-blue font-semibold">
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-astralis-navy text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Let&apos;s Build Smarter Systems, Together</h1>
          <p className="text-xl text-gray-300">
            Ready to transform your operations? Schedule a consultation or reach out directly.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="w-full px-6 py-20 md:px-12 md:py-24 lg:px-20 lg:py-32 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        {/* Tech pattern background */}
        <div className="absolute inset-0 opacity-[0.02]">
          <Image
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=60"
            alt="Technology pattern"
            fill
            className="object-cover"
            loading="lazy"
            sizes="100vw"
          />
        </div>

        <div className="mx-auto max-w-[1280px] relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-6 md:p-10 lg:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-astralis-navy mb-4">Send us a message</h2>
                <p className="text-base text-gray-600 mb-2 leading-relaxed">
                  Fill out the form below and we&apos;ll get back to you within 24 hours.
                </p>
                <p className="text-sm text-gray-500 mb-8">
                  <span className="text-astralis-blue font-medium">*</span> Required fields
                </p>

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Smith"
                        value={formData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        autoComplete="name"
                        required
                        aria-required="true"
                        aria-invalid={errors.name ? 'true' : 'false'}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        className={`w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-astralis-blue focus:border-transparent transition-colors ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <p id="name-error" className="text-sm text-red-600 flex items-center gap-1" role="alert">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@company.com"
                        value={formData.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        autoComplete="email"
                        inputMode="email"
                        required
                        aria-required="true"
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        className={`w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-astralis-blue focus:border-transparent transition-colors ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p id="email-error" className="text-sm text-red-600 flex items-center gap-1" role="alert">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Company Field */}
                  <div className="space-y-2">
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                      Company
                    </label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <input
                        id="company"
                        name="company"
                        type="text"
                        placeholder="Acme Corp"
                        value={formData.company}
                        onChange={(e) => handleFieldChange('company', e.target.value)}
                        autoComplete="organization"
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-astralis-blue focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>

                  {/* Subject Field */}
                  <div className="space-y-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                      Subject *
                    </label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        placeholder="How can we help?"
                        value={formData.subject}
                        onChange={(e) => handleFieldChange('subject', e.target.value)}
                        required
                        aria-required="true"
                        aria-invalid={errors.subject ? 'true' : 'false'}
                        aria-describedby={errors.subject ? 'subject-error' : undefined}
                        className={`w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-astralis-blue focus:border-transparent transition-colors ${
                          errors.subject ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.subject && (
                      <p id="subject-error" className="text-sm text-red-600 flex items-center gap-1" role="alert">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                        Message *
                      </label>
                      <span className="text-xs text-gray-500" aria-live="polite">
                        {formData.message.length} / 500 characters
                      </span>
                    </div>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Tell us about your project or question..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleFieldChange('message', e.target.value)}
                      maxLength={500}
                      required
                      aria-required="true"
                      aria-invalid={errors.message ? 'true' : 'false'}
                      aria-describedby={errors.message ? 'message-error' : undefined}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-astralis-blue focus:border-transparent transition-colors ${
                        errors.message ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.message && (
                      <p id="message-error" className="text-sm text-red-600 flex items-center gap-1" role="alert">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Success Message */}
                  {submitStatus === 'success' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md" role="alert" aria-live="polite">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-green-800">{submitMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {submitStatus === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md" role="alert" aria-live="assertive">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-red-800">{submitMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full sm:w-auto min-w-[200px] bg-astralis-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 md:space-y-8">
              {/* Direct Contact Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-lg">
                <h3 className="text-xl font-bold text-astralis-navy mb-6">Direct Contact</h3>
                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-astralis-blue/10 flex-shrink-0">
                      <svg className="w-5 h-5 text-astralis-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Email</p>
                      <a href="mailto:support@astralisone.com" className="text-astralis-blue hover:text-blue-700 font-medium hover:underline">
                        support@astralisone.com
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-astralis-blue/10 flex-shrink-0">
                      <svg className="w-5 h-5 text-astralis-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Phone</p>
                      <a href="tel:+13412234433" className="text-astralis-blue hover:text-blue-700 font-medium hover:underline">
                        +1 (341) 223-4433
                      </a>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-astralis-blue/10 flex-shrink-0">
                      <svg className="w-5 h-5 text-astralis-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Location</p>
                      <p className="text-gray-600 text-sm">
                        Remote-first operations<br />Serving clients globally
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Consultation Card */}
              <div className="bg-gradient-to-br from-astralis-blue via-blue-600 to-astralis-blue rounded-xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <Image
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=60"
                    alt="Tech pattern"
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="33vw"
                  />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Schedule a Consultation</h3>
                  <p className="text-blue-100 text-base mb-6 leading-relaxed">
                    Book a free 30-minute call to discuss your automation needs.
                  </p>
                  <a
                    href="https://app.astralisone.com/booking"
                    className="block w-full text-center bg-white text-astralis-blue hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
                  >
                    Book a Call
                  </a>
                </div>
              </div>

              {/* Response Time Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-astralis-blue/10 flex-shrink-0">
                    <svg className="w-4 h-4 text-astralis-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-astralis-navy mb-1">Response time</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      We typically respond within 24 hours during business days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-astralis-navy text-white py-12 px-6 mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Astralis One</h3>
              <p className="text-gray-400 text-sm">
                Enterprise AI operations platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/services" className="hover:text-white transition-colors">Services</Link></li>
                <li><Link href="/solutions" className="hover:text-white transition-colors">Solutions</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="https://app.astralisone.com/auth/signin" className="hover:text-white transition-colors">
                    Sign In
                  </a>
                </li>
                <li>
                  <a href="https://app.astralisone.com/auth/signup" className="hover:text-white transition-colors">
                    Sign Up
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            &copy; 2024 Astralis One. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
