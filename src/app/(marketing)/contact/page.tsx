/**
 * Contact Page - Astralis Specification Section 4.7
 */

'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Hero } from '@/components/sections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Calendar, MapPin, Phone, User, Briefcase, MessageSquare, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useState, FormEvent } from 'react';

const BookingModal = dynamic(
  () => import('@/components/booking/BookingModal').then(mod => ({ default: mod.BookingModal })),
  { ssr: false }
);

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
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
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
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send message');
      setSubmitStatus('success');
      setSubmitMessage(data.message || "Thank you for contacting us! We'll get back to you within 24 hours.");
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
      <Hero
        headline="Let's Build Smarter Systems, Together"
        description="Ready to transform your operations? Schedule a consultation or reach out directly."
        variant="dark"
        className="bg-astralis-navy"
        textAlign="center"
        textColumnWidth="two-thirds"
      />
      <section className="w-full px-6 py-20 md:px-12 md:py-24 lg:px-20 lg:py-32 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
        {/* Tech pattern background */}
        <div className="absolute inset-0 opacity-[0.02]">
          <Image src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=60" alt="Technology pattern" fill className="object-cover" loading="lazy" sizes="100vw" />
        </div>
        <div className="mx-auto max-w-[1280px] relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-6 md:p-10 lg:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-astralis-navy mb-4">Send us a message</h2>
                <p className="text-base text-slate-600 mb-2 leading-relaxed">Fill out the form below and we'll get back to you within 24 hours.</p>
                <p className="text-sm text-slate-500 mb-8"><span className="text-astralis-blue font-medium">*</span> Required fields</p>
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <Input id="name" name="name" type="text" placeholder="John Smith" value={formData.name} onChange={(e) => handleFieldChange('name', e.target.value)} autoComplete="name" required aria-required="true" aria-invalid={errors.name ? 'true' : 'false'} aria-describedby={errors.name ? 'name-error' : undefined} className={`bg-white border-slate-300 pl-10 ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                    </div>
                    {errors.name && <p id="name-error" className="text-sm text-red-600 flex items-center gap-1" role="alert"><AlertCircle className=" ui-icon w-5 h-5" />{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <Input id="email" name="email" type="email" placeholder="john@company.com" value={formData.email} onChange={(e) => handleFieldChange('email', e.target.value)} autoComplete="email" inputMode="email" required aria-required="true" aria-invalid={errors.email ? 'true' : 'false'} aria-describedby={errors.email ? 'email-error' : undefined} className={`bg-white border-slate-300 pl-10 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                    </div>
                    {errors.email && <p id="email-error" className="text-sm text-red-600 flex items-center gap-1" role="alert"><AlertCircle className=" ui-icon w-5 h-5" />{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-slate-700">Company</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <Input id="company" name="company" type="text" placeholder="Acme Corp" value={formData.company} onChange={(e) => handleFieldChange('company', e.target.value)} autoComplete="organization" className="bg-white border-slate-300 pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-slate-700">Subject *</Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <Input id="subject" name="subject" type="text" placeholder="How can we help?" value={formData.subject} onChange={(e) => handleFieldChange('subject', e.target.value)} required aria-required="true" aria-invalid={errors.subject ? 'true' : 'false'} aria-describedby={errors.subject ? 'subject-error' : undefined} className={`bg-white border-slate-300 pl-10 ${errors.subject ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                    </div>
                    {errors.subject && <p id="subject-error" className="text-sm text-red-600 flex items-center gap-1" role="alert"><AlertCircle className=" ui-icon w-5 h-5" />{errors.subject}</p>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="message" className="text-slate-700">Message *</Label>
                      <span className="text-xs text-slate-500" aria-live="polite">{formData.message.length} / 500 characters</span>
                    </div>
                    <Textarea id="message" name="message" placeholder="Tell us about your project or question..." rows={6} value={formData.message} onChange={(e) => handleFieldChange('message', e.target.value)} maxLength={500} required aria-required="true" aria-invalid={errors.message ? 'true' : 'false'} aria-describedby={errors.message ? 'message-error' : undefined} className={`bg-white border-slate-300 ${errors.message ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                    {errors.message && <p id="message-error" className="text-sm text-red-600 flex items-center gap-1" role="alert"><AlertCircle className=" ui-icon w-5 h-5" />{errors.message}</p>}
                  </div>
                  {submitStatus === 'success' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md" role="alert" aria-live="polite">
                      <div className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><p className="text-sm text-green-800">{submitMessage}</p></div>
                    </div>
                  )}
                  {submitStatus === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md" role="alert" aria-live="assertive">
                      <div className="flex items-start gap-3"><AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" /><p className="text-sm text-red-800">{submitMessage}</p></div>
                    </div>
                  )}
                  <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto min-w-[200px]" disabled={isSubmitting} aria-busy={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Message'}</Button>
                </form>
              </div>
            </div>
            <div className="space-y-6 md:space-y-8">
              <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-lg">
                <h3 className="text-xl font-bold text-astralis-navy mb-6">Direct Contact</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors duration-200">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-astralis-blue/10 flex-shrink-0">
                      <Mail className="w-5 h-5 text-astralis-blue" />
                    </div>
                    <div><p className="text-sm font-semibold text-slate-700 mb-1">Email</p><a href="mailto:support@astralisone.com" className="text-astralis-blue hover:text-blue-700 font-medium hover:underline">support@astralisone.com</a></div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors duration-200">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-astralis-blue/10 flex-shrink-0">
                      <Phone className="w-5 h-5 text-astralis-blue" />
                    </div>
                    <div><p className="text-sm font-semibold text-slate-700 mb-1">Phone</p><a href="tel:+13412234433" className="text-astralis-blue hover:text-blue-700 font-medium hover:underline">+1 (341) 223-4433</a></div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors duration-200">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-astralis-blue/10 flex-shrink-0">
                      <MapPin className="w-5 h-5 text-astralis-blue" />
                    </div>
                    <div><p className="text-sm font-semibold text-slate-700 mb-1">Location</p><p className="text-slate-600 text-sm">Remote-first operations<br />Serving clients globally</p></div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-astralis-blue via-blue-600 to-astralis-blue rounded-xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <Image src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=60" alt="Tech pattern" fill className="object-cover" loading="lazy" sizes="33vw" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm mb-4">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Schedule a Consultation</h3>
                  <p className="text-blue-100 text-base mb-6 leading-relaxed">Book a free 30-minute call to discuss your automation needs.</p>
                  <Button variant="secondary" size="default" className="w-full bg-white text-astralis-blue hover:bg-slate-100 border-0 shadow-lg font-semibold" onClick={() => setIsBookingModalOpen(true)}>Book a Call</Button>
                </div>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-6 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-astralis-blue/10 flex-shrink-0">
                    <Clock className=" ui-icon w-5 h-5 text-astralis-blue" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-astralis-navy mb-1">Response time</p>
                    <p className="text-sm text-slate-600 leading-relaxed">We typically respond within 24 hours during business days.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
    </main>
  );
}
