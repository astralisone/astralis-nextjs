'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks';

interface NewsletterSubscriptionProps {
  variant?: 'default' | 'inline' | 'modal' | 'footer';
  className?: string;
  title?: string;
  description?: string;
  source?: string;
  showPreferences?: boolean;
  buttonText?: string;
}

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  consent: boolean;
  preferences: {
    blogUpdates: boolean;
    productUpdates: boolean;
    marketplaceUpdates: boolean;
    eventNotifications: boolean;
    specialOffers: boolean;
    frequency: 'WEEKLY' | 'MONTHLY';
  };
}

export function NewsletterSubscription({
  variant = 'default',
  className = '',
  title,
  description,
  source = 'website',
  showPreferences = false,
  buttonText = 'Subscribe'
}: NewsletterSubscriptionProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    consent: false,
    preferences: {
      blogUpdates: true,
      productUpdates: true,
      marketplaceUpdates: false,
      eventNotifications: false,
      specialOffers: false,
      frequency: 'WEEKLY'
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!formData.email) {
        throw new Error('Email address is required');
      }

      if (!formData.consent) {
        throw new Error('You must agree to receive our newsletter');
      }

      const subscriptionData = {
        email: formData.email,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        source,
        consent: formData.consent,
        ...(showPreferences && { preferences: formData.preferences })
      };

      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSubmitted(true);
        toast({
          title: 'Success!',
          description: result.message,
        });
      } else {
        throw new Error(result.message || 'Failed to subscribe');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: 'Subscription failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updatePreferences = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  // Success state
  if (isSubmitted) {
    return (
      <div className={`${className} text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10
                     border border-green-500/20 rounded-xl backdrop-blur-sm`}>
        <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Almost there!</h3>
        <p className="text-gray-300 text-sm">
          We've sent a confirmation email to <strong className="text-white">{formData.email}</strong>.
          Please check your inbox and click the confirmation link to complete your subscription.
        </p>
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-300 text-xs">
            Don't forget to check your spam folder if you don't see the email within a few minutes.
          </p>
        </div>
      </div>
    );
  }

  // Inline variant (minimal)
  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <div className="flex-1">
          <Input
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-400
                     focus:border-purple-500/50 focus:ring-purple-500/20"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !formData.email}
          className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600
                   hover:to-violet-600 disabled:from-gray-600 disabled:to-gray-600"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              {buttonText}
            </>
          )}
        </Button>
      </form>
    );
  }

  // Footer variant (compact)
  if (variant === 'footer') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Stay Updated</h3>
        </div>
        <p className="text-gray-300 text-sm">
          Get the latest insights on AI, automation, and digital transformation.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Your email address"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-400
                     focus:border-purple-500/50 focus:ring-purple-500/20"
          />
          <div className="flex items-start space-x-2">
            <Checkbox
              id="footer-consent"
              checked={formData.consent}
              onCheckedChange={(checked) => updateFormData('consent', checked)}
              className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
            />
            <Label htmlFor="footer-consent" className="text-xs text-gray-400 leading-4">
              I agree to receive newsletter emails and understand I can unsubscribe at any time.
            </Label>
          </div>
          {error && (
            <Alert className="bg-red-500/10 border-red-500/20">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300 text-sm">{error}</AlertDescription>
            </Alert>
          )}
          <Button
            type="submit"
            disabled={isLoading || !formData.email || !formData.consent}
            className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600
                     hover:to-violet-600 disabled:from-gray-600 disabled:to-gray-600"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                {buttonText}
              </>
            )}
          </Button>
        </form>
      </div>
    );
  }

  // Default/Modal variant (full featured)
  return (
    <Card className={`bg-gradient-to-br from-white/5 to-white/10 border-white/10 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-lg border border-purple-500/20">
            <Mail className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-white">
              {title || 'Stay Ahead of the Curve'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {description || 'Get exclusive insights on AI, automation, and digital transformation'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="bg-red-500/10 border-red-500/20">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-white">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => updateFormData('firstName', e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400
                         focus:border-purple-500/50 focus:ring-purple-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-white">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => updateFormData('lastName', e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400
                         focus:border-purple-500/50 focus:ring-purple-500/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@company.com"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-400
                       focus:border-purple-500/50 focus:ring-purple-500/20"
            />
          </div>

          {showPreferences && (
            <div className="space-y-4">
              <div className="border-t border-white/10 pt-4">
                <h4 className="text-white font-medium mb-3">Email Preferences</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="blogUpdates"
                      checked={formData.preferences.blogUpdates}
                      onCheckedChange={(checked) => updatePreferences('blogUpdates', checked)}
                      className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="blogUpdates" className="text-white text-sm font-medium">
                        Blog Updates
                      </Label>
                      <p className="text-gray-400 text-xs">Latest articles on AI and technology trends</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="productUpdates"
                      checked={formData.preferences.productUpdates}
                      onCheckedChange={(checked) => updatePreferences('productUpdates', checked)}
                      className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="productUpdates" className="text-white text-sm font-medium">
                        Product Updates
                      </Label>
                      <p className="text-gray-400 text-xs">New features and service announcements</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="marketplaceUpdates"
                      checked={formData.preferences.marketplaceUpdates}
                      onCheckedChange={(checked) => updatePreferences('marketplaceUpdates', checked)}
                      className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="marketplaceUpdates" className="text-white text-sm font-medium">
                        Marketplace Updates
                      </Label>
                      <p className="text-gray-400 text-xs">New services and marketplace offerings</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="specialOffers"
                      checked={formData.preferences.specialOffers}
                      onCheckedChange={(checked) => updatePreferences('specialOffers', checked)}
                      className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="specialOffers" className="text-white text-sm font-medium">
                        Special Offers
                      </Label>
                      <p className="text-gray-400 text-xs">Exclusive deals and promotional content</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="text-white text-sm font-medium mb-2 block">Email Frequency</Label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="frequency"
                        value="WEEKLY"
                        checked={formData.preferences.frequency === 'WEEKLY'}
                        onChange={(e) => updatePreferences('frequency', e.target.value)}
                        className="text-purple-500 focus:ring-purple-500 bg-transparent border-white/20"
                      />
                      <span className="text-gray-300 text-sm">Weekly</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="frequency"
                        value="MONTHLY"
                        checked={formData.preferences.frequency === 'MONTHLY'}
                        onChange={(e) => updatePreferences('frequency', e.target.value)}
                        className="text-purple-500 focus:ring-purple-500 bg-transparent border-white/20"
                      />
                      <span className="text-gray-300 text-sm">Monthly</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-2">
            <Checkbox
              id="consent"
              checked={formData.consent}
              onCheckedChange={(checked) => updateFormData('consent', checked)}
              className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
            />
            <Label htmlFor="consent" className="text-gray-400 text-sm leading-5">
              I agree to receive newsletter emails from Astralis Agency and understand that I can
              unsubscribe at any time. By subscribing, I agree to the{' '}
              <a href="/privacy" className="text-purple-400 hover:text-purple-300 underline">
                Privacy Policy
              </a>
              {' '}and{' '}
              <a href="/terms" className="text-purple-400 hover:text-purple-300 underline">
                Terms of Service
              </a>
              . *
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !formData.email || !formData.consent}
            className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600
                     hover:to-violet-600 disabled:from-gray-600 disabled:to-gray-600
                     transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Subscribing...
              </div>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                {buttonText}
              </>
            )}
          </Button>

          <div className="text-center">
            <p className="text-gray-400 text-xs">
              We respect your privacy. No spam, unsubscribe at any time.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
