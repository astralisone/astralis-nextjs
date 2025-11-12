"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks';
import { cn } from '@/lib/utils';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Building,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { format, addDays, isBefore, isToday, isWeekend } from 'date-fns';

interface BookingFormData {
  type: 'revenue-audit' | 'consultation';
  consultationType?: 'STRATEGY' | 'TECHNICAL' | 'IMPLEMENTATION' | 'OPTIMIZATION' | 'TRAINING' | 'GENERAL';
  
  // Personal Information
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  company?: string;
  teamSize?: number;
  industry?: string;
  
  // Scheduling
  selectedDate?: Date;
  selectedTime?: string;
  duration: number;
  timeZone: string;
  meetingType: 'VIDEO_CALL' | 'PHONE_CALL' | 'IN_PERSON';
  
  // Content-specific fields
  currentChallenges?: string;
  objectives?: string;
  specificAreas?: string[];
  revenueGoals?: string;
  currentSystems?: string[];
  painPoints?: string;
  expectedOutcomes?: string;
  currentSituation?: string;
  desiredOutcome?: string;
  budget?: string;
  timeline?: string;
  specificQuestions?: string;
}

interface UnifiedBookingInterfaceProps {
  defaultType?: 'revenue-audit' | 'consultation';
  onBookingComplete?: (booking: any) => void;
  className?: string;
}

const CONSULTATION_TYPES = [
  { value: 'STRATEGY', label: 'Business Strategy', duration: 45 },
  { value: 'TECHNICAL', label: 'Technical Consultation', duration: 60 },
  { value: 'IMPLEMENTATION', label: 'Implementation Planning', duration: 60 },
  { value: 'OPTIMIZATION', label: 'Process Optimization', duration: 45 },
  { value: 'TRAINING', label: 'Training & Education', duration: 30 },
  { value: 'GENERAL', label: 'General Consultation', duration: 30 },
];

const REVENUE_AUDIT_AREAS = [
  'Sales Process', 
  'Marketing Funnel', 
  'Pricing Strategy', 
  'Customer Retention',
  'Digital Transformation',
  'Operational Efficiency',
  'Technology Stack',
  'Data Analytics'
];

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Manufacturing',
  'Professional Services', 'Education', 'Real Estate', 'Hospitality',
  'Non-profit', 'Other'
];

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

export function UnifiedBookingInterface({ 
  defaultType = 'revenue-audit',
  onBookingComplete,
  className 
}: UnifiedBookingInterfaceProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    type: defaultType,
    clientName: '',
    clientEmail: '',
    duration: defaultType === 'revenue-audit' ? 60 : 30,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    meetingType: 'VIDEO_CALL',
    specificAreas: [],
    currentSystems: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const isRevenueAudit = formData.type === 'revenue-audit';
  const totalSteps = 4;

  // Load available time slots when date is selected
  useEffect(() => {
    if (formData.selectedDate) {
      loadAvailableSlots(formData.selectedDate);
    }
  }, [formData.selectedDate, formData.type]);

  const loadAvailableSlots = async (date: Date) => {
    setIsLoading(true);
    try {
      const endpoint = isRevenueAudit ? '/api/revenue-audits' : '/api/consultations';
      const response = await fetch(
        `${endpoint}/availability/${format(date, 'yyyy-MM-dd')}`
      );
      const data = await response.json();
      setAvailableSlots(data.availableSlots || []);
    } catch (error) {
      console.error('Error loading availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available time slots.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (updates: Partial<BookingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const isDateAvailable = (date: Date) => {
    return !isBefore(date, new Date()) && !isWeekend(date);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const endpoint = isRevenueAudit ? '/api/revenue-audits' : '/api/consultations';
      const scheduledAt = formData.selectedDate && formData.selectedTime 
        ? new Date(`${format(formData.selectedDate, 'yyyy-MM-dd')}T${formData.selectedTime}:00`)
        : undefined;

      const payload = {
        ...formData,
        scheduledAt: scheduledAt?.toISOString(),
        title: isRevenueAudit 
          ? `Revenue Operations Audit - ${formData.company || formData.clientName}`
          : `${CONSULTATION_TYPES.find(t => t.value === formData.consultationType)?.label || 'Consultation'} - ${formData.company || formData.clientName}`
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create booking');
      }

      const booking = await response.json();
      
      toast({
        title: 'Booking Confirmed!',
        description: `Your ${isRevenueAudit ? 'revenue audit' : 'consultation'} has been scheduled successfully.`,
        variant: 'default'
      });

      onBookingComplete?.(booking);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Booking Failed',
        description: error.message || 'There was an error creating your booking.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.clientName && formData.clientEmail && formData.company);
      case 2:
        return !!(formData.selectedDate && formData.selectedTime);
      case 3:
        if (isRevenueAudit) {
          return formData.specificAreas!.length > 0;
        } else {
          return !!(formData.consultationType && formData.objectives);
        }
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <React.Fragment key={i}>
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold",
            currentStep > i + 1 
              ? "bg-green-500 text-white" 
              : currentStep === i + 1 
                ? "bg-primary-500 text-white" 
                : "bg-gray-200 text-gray-400"
          )}>
            {currentStep > i + 1 ? <CheckCircle className="w-5 h-5" /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={cn(
              "w-12 h-1 mx-2",
              currentStep > i + 1 ? "bg-green-500" : "bg-gray-200"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Let's Get Started
        </h2>
        <p className="text-gray-300">
          Tell us a bit about yourself and your business
        </p>
      </div>

      {/* Service Type Selection */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold text-white">
          What would you like to book?
        </Label>
        <RadioGroup
          value={formData.type}
          onValueChange={(value: 'revenue-audit' | 'consultation') => 
            updateFormData({ type: value, duration: value === 'revenue-audit' ? 60 : 30 })
          }
          className="space-y-4"
        >
          <div className="flex items-center space-x-3 p-4 glass-card border border-white/10 rounded-lg">
            <RadioGroupItem value="revenue-audit" id="revenue-audit" />
            <div className="flex-1">
              <Label htmlFor="revenue-audit" className="text-white font-semibold cursor-pointer">
                Revenue Operations Audit
              </Label>
              <p className="text-sm text-gray-300 mt-1">
                Comprehensive 60-minute analysis of your revenue processes and optimization opportunities
              </p>
              <Badge variant="secondary" className="mt-2">60 minutes • Free</Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 glass-card border border-white/10 rounded-lg">
            <RadioGroupItem value="consultation" id="consultation" />
            <div className="flex-1">
              <Label htmlFor="consultation" className="text-white font-semibold cursor-pointer">
                Strategy Consultation
              </Label>
              <p className="text-sm text-gray-300 mt-1">
                Focused consultation session to address specific business challenges
              </p>
              <Badge variant="secondary" className="mt-2">30-60 minutes</Badge>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientName" className="text-white">
            <User className="w-4 h-4 inline mr-2" />
            Full Name *
          </Label>
          <Input
            id="clientName"
            value={formData.clientName}
            onChange={(e) => updateFormData({ clientName: e.target.value })}
            placeholder="Enter your full name"
            className="glass-card border-white/20"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="clientEmail" className="text-white">
            <Mail className="w-4 h-4 inline mr-2" />
            Email Address *
          </Label>
          <Input
            id="clientEmail"
            type="email"
            value={formData.clientEmail}
            onChange={(e) => updateFormData({ clientEmail: e.target.value })}
            placeholder="Enter your email"
            className="glass-card border-white/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientPhone" className="text-white">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone Number
          </Label>
          <Input
            id="clientPhone"
            type="tel"
            value={formData.clientPhone || ''}
            onChange={(e) => updateFormData({ clientPhone: e.target.value })}
            placeholder="Enter your phone number"
            className="glass-card border-white/20"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company" className="text-white">
            <Building className="w-4 h-4 inline mr-2" />
            Company Name *
          </Label>
          <Input
            id="company"
            value={formData.company || ''}
            onChange={(e) => updateFormData({ company: e.target.value })}
            placeholder="Enter your company name"
            className="glass-card border-white/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="industry" className="text-white">Industry</Label>
          <Select 
            value={formData.industry} 
            onValueChange={(value) => updateFormData({ industry: value })}
          >
            <SelectTrigger className="glass-card border-white/20">
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map(industry => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="teamSize" className="text-white">Team Size</Label>
          <Input
            id="teamSize"
            type="number"
            min="1"
            value={formData.teamSize || ''}
            onChange={(e) => updateFormData({ teamSize: parseInt(e.target.value) || undefined })}
            placeholder="Number of employees"
            className="glass-card border-white/20"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Schedule Your Session
        </h2>
        <p className="text-gray-300">
          Choose a date and time that works best for you
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold text-white">
            <CalendarIcon className="w-5 h-5 inline mr-2" />
            Select Date
          </Label>
          <div className="glass-card p-4 rounded-lg border border-white/10">
            <Calendar
              mode="single"
              selected={formData.selectedDate}
              onSelect={(date: Date | undefined) => updateFormData({ selectedDate: date })}
              disabled={(date: Date) => !isDateAvailable(date)}
              className="rounded-md"
            />
          </div>
        </div>

        {/* Time Slots */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold text-white">
            <Clock className="w-5 h-5 inline mr-2" />
            Available Times
          </Label>
          {formData.selectedDate ? (
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="text-gray-300 mt-2">Loading available times...</p>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map(time => (
                    <Button
                      key={time}
                      variant={formData.selectedTime === time ? "default" : "outline"}
                      className={cn(
                        "text-sm",
                        formData.selectedTime === time
                          ? "bg-primary-500 text-white border-primary-500"
                          : "glass-card border-white/20 text-white hover:border-primary-500/50"
                      )}
                      onClick={() => updateFormData({ selectedTime: time })}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 glass-card rounded-lg border border-white/10">
                  <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                  <p className="text-white font-semibold">No available slots</p>
                  <p className="text-gray-300 text-sm">Please choose a different date</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 glass-card rounded-lg border border-white/10">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-300">Please select a date first</p>
            </div>
          )}
        </div>
      </div>

      {/* Meeting Type */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold text-white">Meeting Type</Label>
        <RadioGroup
          value={formData.meetingType}
          onValueChange={(value: any) => updateFormData({ meetingType: value })}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="flex items-center space-x-3 p-4 glass-card border border-white/10 rounded-lg">
            <RadioGroupItem value="VIDEO_CALL" id="video" />
            <Label htmlFor="video" className="text-white cursor-pointer">
              Video Call (Recommended)
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 glass-card border border-white/10 rounded-lg">
            <RadioGroupItem value="PHONE_CALL" id="phone" />
            <Label htmlFor="phone" className="text-white cursor-pointer">
              Phone Call
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 glass-card border border-white/10 rounded-lg">
            <RadioGroupItem value="IN_PERSON" id="in-person" />
            <Label htmlFor="in-person" className="text-white cursor-pointer">
              In Person
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          {isRevenueAudit ? 'Audit Focus Areas' : 'Consultation Details'}
        </h2>
        <p className="text-gray-300">
          Help us prepare for your session by sharing some details
        </p>
      </div>

      {isRevenueAudit ? (
        <>
          {/* Audit Areas */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-white">
              Which areas would you like us to focus on? (Select all that apply)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {REVENUE_AUDIT_AREAS.map(area => (
                <div key={area} className="flex items-center space-x-2">
                  <Checkbox
                    id={area}
                    checked={formData.specificAreas?.includes(area)}
                    onCheckedChange={(checked) => {
                      const current = formData.specificAreas || [];
                      updateFormData({
                        specificAreas: checked 
                          ? [...current, area]
                          : current.filter(a => a !== area)
                      });
                    }}
                  />
                  <Label 
                    htmlFor={area} 
                    className="text-sm text-white cursor-pointer"
                  >
                    {area}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Current Systems */}
          <div className="space-y-2">
            <Label htmlFor="currentSystems" className="text-white">
              Current Tools & Systems (comma-separated)
            </Label>
            <Input
              id="currentSystems"
              value={(formData.currentSystems || []).join(', ')}
              onChange={(e) => updateFormData({ 
                currentSystems: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
              })}
              placeholder="e.g. Salesforce, HubSpot, Stripe, QuickBooks"
              className="glass-card border-white/20"
            />
          </div>

          {/* Revenue Goals */}
          <div className="space-y-2">
            <Label htmlFor="revenueGoals" className="text-white">
              Revenue Goals & Objectives
            </Label>
            <Textarea
              id="revenueGoals"
              value={formData.revenueGoals || ''}
              onChange={(e) => updateFormData({ revenueGoals: e.target.value })}
              placeholder="Tell us about your revenue targets and what you're trying to achieve"
              className="glass-card border-white/20"
              rows={3}
            />
          </div>

          {/* Pain Points */}
          <div className="space-y-2">
            <Label htmlFor="painPoints" className="text-white">
              Current Challenges
            </Label>
            <Textarea
              id="painPoints"
              value={formData.painPoints || ''}
              onChange={(e) => updateFormData({ painPoints: e.target.value })}
              placeholder="What revenue challenges are you currently facing?"
              className="glass-card border-white/20"
              rows={3}
            />
          </div>
        </>
      ) : (
        <>
          {/* Consultation Type */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-white">
              Consultation Type *
            </Label>
            <RadioGroup
              value={formData.consultationType}
              onValueChange={(value: any) => {
                const type = CONSULTATION_TYPES.find(t => t.value === value);
                updateFormData({ 
                  consultationType: value,
                  duration: type?.duration || 30
                });
              }}
              className="space-y-2"
            >
              {CONSULTATION_TYPES.map(type => (
                <div key={type.value} className="flex items-center space-x-3 p-3 glass-card border border-white/10 rounded-lg">
                  <RadioGroupItem value={type.value} id={type.value} />
                  <div className="flex-1">
                    <Label htmlFor={type.value} className="text-white cursor-pointer">
                      {type.label}
                    </Label>
                    <p className="text-sm text-gray-300">
                      {type.duration} minutes
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Objectives */}
          <div className="space-y-2">
            <Label htmlFor="objectives" className="text-white">
              Objectives *
            </Label>
            <Textarea
              id="objectives"
              value={formData.objectives || ''}
              onChange={(e) => updateFormData({ objectives: e.target.value })}
              placeholder="What would you like to achieve from this consultation?"
              className="glass-card border-white/20"
              rows={3}
            />
          </div>

          {/* Current Situation */}
          <div className="space-y-2">
            <Label htmlFor="currentSituation" className="text-white">
              Current Situation
            </Label>
            <Textarea
              id="currentSituation"
              value={formData.currentSituation || ''}
              onChange={(e) => updateFormData({ currentSituation: e.target.value })}
              placeholder="Tell us about your current business situation"
              className="glass-card border-white/20"
              rows={3}
            />
          </div>

          {/* Budget & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-white">Budget Range</Label>
              <Select 
                value={formData.budget} 
                onValueChange={(value) => updateFormData({ budget: value })}
              >
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-10k">Under $10K</SelectItem>
                  <SelectItem value="10k-25k">$10K - $25K</SelectItem>
                  <SelectItem value="25k-50k">$25K - $50K</SelectItem>
                  <SelectItem value="50k-100k">$50K - $100K</SelectItem>
                  <SelectItem value="over-100k">Over $100K</SelectItem>
                  <SelectItem value="discuss">Let's discuss</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeline" className="text-white">Timeline</Label>
              <Select 
                value={formData.timeline} 
                onValueChange={(value) => updateFormData({ timeline: value })}
              >
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asap">ASAP</SelectItem>
                  <SelectItem value="1-month">Within 1 month</SelectItem>
                  <SelectItem value="3-months">Within 3 months</SelectItem>
                  <SelectItem value="6-months">Within 6 months</SelectItem>
                  <SelectItem value="planning">Just planning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Specific Questions */}
          <div className="space-y-2">
            <Label htmlFor="specificQuestions" className="text-white">
              Specific Questions
            </Label>
            <Textarea
              id="specificQuestions"
              value={formData.specificQuestions || ''}
              onChange={(e) => updateFormData({ specificQuestions: e.target.value })}
              placeholder="Any specific questions you'd like to discuss?"
              className="glass-card border-white/20"
              rows={3}
            />
          </div>
        </>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Sparkles className="w-16 h-16 text-primary-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Review & Confirm
        </h2>
        <p className="text-gray-300">
          Please review your booking details
        </p>
      </div>

      <div className="glass-card p-6 rounded-lg border border-white/10">
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">
              {isRevenueAudit ? 'Revenue Operations Audit' : 
               CONSULTATION_TYPES.find(t => t.value === formData.consultationType)?.label}
            </h3>
            <Badge variant="secondary">{formData.duration} minutes</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-300">Date & Time</p>
              <p className="text-white font-semibold">
                {formData.selectedDate && format(formData.selectedDate, 'EEEE, MMMM d, yyyy')} at {formData.selectedTime}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-300">Meeting Type</p>
              <p className="text-white font-semibold">
                {formData.meetingType.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-300">Contact</p>
              <p className="text-white font-semibold">{formData.clientName}</p>
              <p className="text-gray-300 text-sm">{formData.clientEmail}</p>
            </div>
            <div>
              <p className="text-sm text-gray-300">Company</p>
              <p className="text-white font-semibold">{formData.company}</p>
              {formData.industry && (
                <p className="text-gray-300 text-sm">{formData.industry}</p>
              )}
            </div>
          </div>

          {isRevenueAudit && formData.specificAreas && formData.specificAreas.length > 0 && (
            <div>
              <p className="text-sm text-gray-300 mb-2">Focus Areas</p>
              <div className="flex flex-wrap gap-2">
                {formData.specificAreas.map(area => (
                  <Badge key={area} variant="outline" className="border-primary-500/50 text-primary-400">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {formData.objectives && (
            <div>
              <p className="text-sm text-gray-300">Objectives</p>
              <p className="text-white text-sm">{formData.objectives}</p>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-6 h-6 text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-white font-semibold mb-1">What Happens Next?</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• You'll receive a confirmation email with meeting details</li>
              <li>• A calendar invite will be sent to you</li>
              <li>• We'll send a reminder 24 hours before the meeting</li>
              <li>• {isRevenueAudit ? 'Prepare any revenue-related questions' : 'Come prepared with your questions'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      <Card className="glass-elevated border-white/10">
        <CardHeader>
          {renderStepIndicator()}
        </CardHeader>
        
        <CardContent className="space-y-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation */}
          <div className="flex justify-between pt-8 border-t border-white/10">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="glass-card border-white/20 text-white"
            >
              Back
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed(currentStep)}
                className="btn-primary"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !canProceed(currentStep)}
                className="btn-primary"
              >
                {isSubmitting ? 'Booking...' : `Confirm ${isRevenueAudit ? 'Audit' : 'Consultation'}`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}