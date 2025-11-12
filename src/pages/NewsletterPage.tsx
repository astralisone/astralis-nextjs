import { NewsletterSubscription } from '@/components/newsletter/NewsletterSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Zap,
  CheckCircle,
  Clock,
  Shield,
  BookOpen,
  Briefcase,
  Gift
} from 'lucide-react';

export default function NewsletterPage() {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Industry Insights',
      description: 'Stay ahead with cutting-edge AI and automation trends',
      color: 'text-green-400'
    },
    {
      icon: BookOpen,
      title: 'Case Studies',
      description: 'Real-world transformation success stories and practical guides',
      color: 'text-blue-400'
    },
    {
      icon: Briefcase,
      title: 'Business Impact',
      description: 'Actionable strategies to transform your operations',
      color: 'text-purple-400'
    },
    {
      icon: Gift,
      title: 'Exclusive Content',
      description: 'Tools and resources available only to subscribers',
      color: 'text-yellow-400'
    },
    {
      icon: Users,
      title: 'Community Access',
      description: 'Join a network of forward-thinking business leaders',
      color: 'text-violet-400'
    },
    {
      icon: Zap,
      title: 'Early Access',
      description: 'Be first to know about new services and features',
      color: 'text-red-400'
    }
  ];

  const stats = [
    { label: 'Active Subscribers', value: '25,000+', icon: Users },
    { label: 'Weekly Insights', value: '50+', icon: BookOpen },
    { label: 'Success Stories', value: '200+', icon: TrendingUp },
    { label: 'Expert Analysis', value: 'Weekly', icon: Sparkles }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-violet-900/20">
      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-violet-500/20 to-indigo-500/20"></div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-purple-500/20 
                          to-violet-500/20 rounded-full border border-purple-500/20 mb-8">
              <Mail className="h-12 w-12 text-purple-400" />
            </div>
            
            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 
                         via-violet-400 to-indigo-400 bg-clip-text text-transparent mb-6">
              Stay Ahead of the AI Revolution
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8">
              Join 25,000+ business leaders who get exclusive insights on AI, automation, 
              and digital transformation delivered to their inbox every week.
            </p>
            
            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 px-4 py-2">
                <CheckCircle className="h-4 w-4 mr-2" />
                GDPR Compliant
              </Badge>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-4 py-2">
                <Shield className="h-4 w-4 mr-2" />
                Privacy Protected
              </Badge>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 px-4 py-2">
                <Clock className="h-4 w-4 mr-2" />
                Weekly Updates
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Column - Benefits */}
          <div className="space-y-12">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm text-center">
                  <CardContent className="p-6">
                    <stat.icon className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* What You'll Get */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-8 text-center lg:text-left">
                What You'll Get
              </h2>
              <div className="grid gap-6">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 bg-white/10 rounded-lg border border-white/10`}>
                          <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                          <p className="text-gray-400">{benefit.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Social Proof */}
            <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Sparkles className="h-5 w-5 text-yellow-400 mr-2" />
                  Join the Community
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Trusted by founders, CEOs, and decision-makers at companies like:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-white font-medium">Tech Startups</div>
                    <div className="text-sm text-gray-400">500+</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-white font-medium">Enterprise</div>
                    <div className="text-sm text-gray-400">200+</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-white font-medium">Agencies</div>
                    <div className="text-sm text-gray-400">150+</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-white font-medium">Consultancies</div>
                    <div className="text-sm text-gray-400">100+</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Subscription Form */}
          <div className="lg:sticky lg:top-8">
            <NewsletterSubscription
              variant="default"
              title="Get Weekly AI Insights"
              description="Join thousands of business leaders transforming their operations with AI"
              source="newsletter-page"
              showPreferences={true}
              buttonText="Join the Newsletter"
              className="shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white/5 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  How often will I receive emails?
                </h3>
                <p className="text-gray-400">
                  By default, you'll receive our weekly newsletter every Wednesday. You can adjust 
                  your preferences to receive updates daily, weekly, monthly, or quarterly based on 
                  your preference.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Can I customize what content I receive?
                </h3>
                <p className="text-gray-400">
                  Absolutely! You can choose to receive blog updates, product announcements, 
                  marketplace updates, event notifications, and special offers. You'll receive 
                  a link to manage your preferences after subscribing.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Is my data secure?
                </h3>
                <p className="text-gray-400">
                  Yes, we take data security seriously. We're GDPR compliant and never share 
                  your information with third parties. You can unsubscribe at any time and 
                  request deletion of your data.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  What if I change my mind?
                </h3>
                <p className="text-gray-400">
                  You can unsubscribe at any time by clicking the unsubscribe link in any email 
                  or by managing your preferences. There's no commitment, and you can always 
                  resubscribe later.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the community of forward-thinking leaders who are already leveraging AI 
            to drive unprecedented growth and efficiency.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-400 mr-1" />
              No spam, ever
            </span>
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-400 mr-1" />
              Unsubscribe anytime
            </span>
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-400 mr-1" />
              GDPR compliant
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}