import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Helmet } from 'react-helmet-async';
import {
  CheckCircle as CheckCircleIcon,
  Calendar,
  Clock as ClockIcon,
  Mail as EnvelopeIcon,
  Video as VideoCameraIcon,
  Phone as PhoneIcon,
  User as UserIcon,
  Building as BuildingOfficeIcon
} from 'lucide-react';
import { format } from 'date-fns';

interface BookingSuccessState {
  booking: any;
  type: 'revenue-audit' | 'consultation';
}

export default function BookingSuccessPage() {
  const router = useRouter();
  const [state, setState] = useState<BookingSuccessState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Read booking data from localStorage
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('bookingData');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setState(parsedData);
          // Clear the data after reading
          localStorage.removeItem('bookingData');
        } catch (error) {
          console.error('Error parsing booking data:', error);
        }
      }
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // If no booking data after loading, redirect to home
    if (!isLoading && !state) {
      setTimeout(() => router.push('/'), 3000);
    }
  }, [isLoading, state, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-primary-950/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!state || !state.booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-primary-950/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Redirecting...</p>
        </div>
      </div>
    );
  }

  const { booking, type } = state;
  const isRevenueAudit = type === 'revenue-audit';

  const getMeetingTypeIcon = () => {
    switch (booking.meetingType) {
      case 'VIDEO_CALL':
        return <VideoCameraIcon className="w-5 h-5" />;
      case 'PHONE_CALL':
        return <PhoneIcon className="w-5 h-5" />;
      default:
        return <UserIcon className="w-5 h-5" />;
    }
  };

  const getMeetingTypeLabel = () => {
    switch (booking.meetingType) {
      case 'VIDEO_CALL':
        return 'Video Call';
      case 'PHONE_CALL':
        return 'Phone Call';
      case 'IN_PERSON':
        return 'In Person';
      default:
        return 'Meeting';
    }
  };

  return (
    <>
      <Helmet>
        <title>Booking Confirmed - Astralis Agency</title>
        <meta name="description" content="Your booking has been confirmed. We look forward to speaking with you!" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-primary-950/20">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto">
            
            {/* Success Header */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                <CheckCircleIcon className="w-10 h-10 text-green-400" />
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-black text-white mb-4">
                Booking Confirmed!
              </h1>
              
              <p className="text-xl text-gray-300 mb-6">
                Your {isRevenueAudit ? 'revenue audit' : 'consultation'} has been successfully scheduled. 
                We're excited to work with you!
              </p>

              <Badge variant="secondary" className="text-lg px-4 py-2">
                Booking ID: {booking.id.slice(-8).toUpperCase()}
              </Badge>
            </div>

            {/* Booking Details */}
            <Card className="glass-elevated border-white/10 mb-8">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Left Column - Booking Info */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-6">
                        {isRevenueAudit ? 'Revenue Operations Audit' : booking.title}
                      </h2>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="w-6 h-6 text-primary-400" />
                      <div>
                        <p className="text-white font-semibold">
                          {booking.scheduledAt && format(new Date(booking.scheduledAt), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-gray-300 text-sm">
                          {booking.scheduledAt && format(new Date(booking.scheduledAt), 'h:mm a')} 
                          {booking.timeZone && ` (${booking.timeZone})`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <ClockIcon className="w-6 h-6 text-blue-400" />
                      <div>
                        <p className="text-white font-semibold">{booking.duration} minutes</p>
                        <p className="text-gray-300 text-sm">Duration</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {getMeetingTypeIcon()}
                      <div>
                        <p className="text-white font-semibold">{getMeetingTypeLabel()}</p>
                        {booking.meetingUrl && (
                          <p className="text-gray-300 text-sm">Meeting link will be provided</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <UserIcon className="w-6 h-6 text-green-400" />
                      <div>
                        <p className="text-white font-semibold">{booking.clientName}</p>
                        <p className="text-gray-300 text-sm">{booking.clientEmail}</p>
                      </div>
                    </div>

                    {booking.company && (
                      <div className="flex items-center space-x-3">
                        <BuildingOfficeIcon className="w-6 h-6 text-purple-400" />
                        <div>
                          <p className="text-white font-semibold">{booking.company}</p>
                          {booking.industry && (
                            <p className="text-gray-300 text-sm">{booking.industry}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Next Steps */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white">What Happens Next?</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-primary-400 font-semibold text-sm">1</span>
                        </div>
                        <div>
                          <p className="text-white font-semibold">Confirmation Email</p>
                          <p className="text-gray-300 text-sm">
                            You'll receive a confirmation email with all the meeting details within the next few minutes.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-blue-400 font-semibold text-sm">2</span>
                        </div>
                        <div>
                          <p className="text-white font-semibold">Calendar Invite</p>
                          <p className="text-gray-300 text-sm">
                            A calendar invite will be sent to help you keep track of the appointment.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-green-400 font-semibold text-sm">3</span>
                        </div>
                        <div>
                          <p className="text-white font-semibold">Reminder</p>
                          <p className="text-gray-300 text-sm">
                            We'll send you a reminder 24 hours before your scheduled meeting.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-purple-400 font-semibold text-sm">4</span>
                        </div>
                        <div>
                          <p className="text-white font-semibold">Meeting Time</p>
                          <p className="text-gray-300 text-sm">
                            {isRevenueAudit 
                              ? 'Join us for your comprehensive revenue audit session.'
                              : 'Join us for your strategic consultation session.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Preparation Tips */}
                    <div className="glass-card p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
                      <h4 className="text-white font-semibold mb-2 flex items-center">
                        <span className="text-blue-400 mr-2">💡</span>
                        How to Prepare
                      </h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {isRevenueAudit ? (
                          <>
                            <li>• Gather current revenue metrics and goals</li>
                            <li>• List your existing tools and systems</li>
                            <li>• Prepare questions about revenue challenges</li>
                            <li>• Have access to relevant business data</li>
                          </>
                        ) : (
                          <>
                            <li>• Prepare an overview of your current situation</li>
                            <li>• List specific objectives for the consultation</li>
                            <li>• Gather any relevant documents or data</li>
                            <li>• Prepare questions you'd like to discuss</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="glass-card border-white/10 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <EnvelopeIcon className="w-6 h-6 text-primary-400" />
                  <div>
                    <p className="text-white font-semibold">Need to make changes?</p>
                    <p className="text-gray-300 text-sm">
                      Reply to the confirmation email or contact us at{' '}
                      <a href="mailto:hello@astralisagency.com" className="text-primary-400 hover:underline">
                        hello@astralisagency.com
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => router.push('/')}
                className="btn-primary"
              >
                Return Home
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => router.push('/services')}
                className="glass-card border-white/20 text-white hover:border-primary-500/50"
              >
                Explore Our Services
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}