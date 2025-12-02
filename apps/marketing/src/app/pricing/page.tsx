import Link from 'next/link';

export default function PricingPage() {
  return (
    <main className="min-h-screen">
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
            <Link href="/pricing" className="text-gray-600 hover:text-astralis-blue font-semibold">
              Pricing
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-astralis-blue">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-astralis-blue">
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-astralis-navy to-slate-900 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8">
            Choose the platform and services that fit your organization&apos;s needs
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="#platform"
              className="bg-astralis-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Platform Pricing
            </a>
            <a
              href="#services"
              className="border border-white hover:bg-white hover:text-astralis-navy text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Service Packages
            </a>
          </div>
        </div>
      </section>

      {/* Platform Pricing Section */}
      <section id="platform" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-astralis-navy mb-4">
              AstralisOps Platform Pricing
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Core operations platform with AI-powered automation, scheduling, and document processing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <PricingCard
              title="Starter"
              price="$99"
              period="per month"
              description="Core operations platform for small teams getting started with automation."
              features={[
                'AI intake routing (500 requests/mo)',
                'Basic scheduling workflows',
                'Document processing (100 docs/mo)',
                '3 team members',
                '5 active pipelines',
                'Email support',
              ]}
              cta="Get Started"
              ctaLink="/contact?plan=starter"
            />

            <PricingCard
              title="Professional"
              price="$299"
              period="per month"
              description="Advanced automation and integrations for growing operations teams."
              features={[
                'AI intake routing (5,000 requests/mo)',
                'Advanced scheduling + calendar sync',
                'Document processing (1,000 docs/mo)',
                '15 team members',
                'Unlimited pipelines',
                'Custom workflow builder',
                'CRM integrations (HubSpot, Salesforce)',
                'Priority support',
              ]}
              cta="Start Trial"
              ctaLink="/contact?plan=professional"
              highlighted={true}
            />

            <PricingCard
              title="Enterprise"
              price="Custom"
              period="pricing"
              description="Tailored solutions with dedicated infrastructure and white-glove support."
              features={[
                'Unlimited requests & documents',
                'Unlimited team members',
                'Custom AI model training',
                'Advanced security & compliance',
                'Dedicated infrastructure',
                'Custom integrations',
                'SLA guarantees',
                '24/7 enterprise support',
              ]}
              cta="Contact Sales"
              ctaLink="/contact?plan=enterprise"
            />
          </div>

          {/* Platform Features Note */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 mt-16">
            <h3 className="text-xl font-semibold mb-4 text-center text-astralis-navy">
              All Platform Plans Include
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <FeatureItem text="Multi-agent orchestration" />
              <FeatureItem text="Document OCR & processing" />
              <FeatureItem text="Pipeline management" />
              <FeatureItem text="Workflow automation" />
              <FeatureItem text="Vector embeddings" />
              <FeatureItem text="RAG-powered chat" />
              <FeatureItem text="Scheduling system" />
              <FeatureItem text="Analytics & reporting" />
              <FeatureItem text="Secure data encryption & backups" />
            </div>
          </div>
        </div>
      </section>

      {/* Service Packages Section */}
      <section id="services" className="py-20 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-astralis-navy mb-4">
              Automation Service Packages
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Professional automation setup and implementation services. One-time setup fees plus optional ongoing support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServicePackageCard
              title="New Client Onboarding Setup"
              setupFee="$750"
              monthlyFee="$99/mo"
              description="Set up online forms so new clients can submit their information automatically. No more manual data entry."
              features={[
                'Custom online forms',
                'Automatic error checking',
                'Email notifications',
                'Client database integration',
                'Document collection',
                'Client status portal',
              ]}
            />

            <ServicePackageCard
              title="Document Storage & Search"
              setupFee="$1,200"
              monthlyFee="$149/mo"
              description="Organize all your business documents in one searchable system. Find any file in seconds."
              features={[
                'Document upload & storage',
                'Automatic filing & tagging',
                'Full-text search',
                'Version tracking',
                'Access controls',
                'Automatic daily backups',
              ]}
              highlighted={true}
            />

            <ServicePackageCard
              title="Full Business Automation"
              setupFee="$3,500"
              monthlyFee="Contact us"
              description="Automate your entire operation - from booking appointments to sending invoices."
              features={[
                'Online appointment booking',
                'Automatic invoicing',
                'Invoice generation from appointments',
                'Payment processing (card & ACH)',
                'Custom reports & analytics',
                'Team messaging & tasks',
              ]}
            />

            <ServicePackageCard
              title="Built Just for Your Business"
              setupFee="$7,500–$25,000"
              monthlyFee="Custom"
              description="Custom automation designed specifically for your unique business needs."
              features={[
                'Custom workflow design',
                'Connect to any software',
                'Legacy system integration',
                'Advanced analytics',
                'Dedicated support team',
                'Staff training & user guides',
              ]}
            />

            <ServicePackageCard
              title="Monthly Support & Improvements"
              setupFee="N/A"
              monthlyFee="$450/mo"
              description="Keep your automation running smoothly with ongoing maintenance and updates."
              features={[
                'Monthly performance review',
                'Speed optimizations',
                'Issue resolution',
                'Priority support',
                'New feature additions',
                'Monthly usage reports',
              ]}
            />
          </div>

          {/* Service Package Note */}
          <div className="mt-12 text-center">
            <p className="text-sm text-slate-600">
              All service packages include initial consultation, custom configuration, training, and 30 days of post-launch support.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-astralis-navy mb-4">
              Detailed Feature Comparison
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Compare platform tiers to find the right fit for your team
            </p>
          </div>

          <FeatureComparisonTable />

        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-astralis-navy mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600">
              Everything you need to know about our pricing and plans
            </p>
          </div>

          <div className="space-y-6">
            <FAQItem
              question="Can I try Astralis One before purchasing?"
              answer="Yes! We offer a 14-day free trial with full access to Professional plan features. No credit card required. You can explore all platform capabilities and cancel anytime during the trial period."
            />
            <FAQItem
              question="What&apos;s the difference between platform pricing and service packages?"
              answer="Platform pricing is for ongoing access to the AstralisOps software (monthly subscription). Service packages are one-time setup fees for professional implementation of specific automation workflows. Many customers combine both - using the platform subscription with setup services."
            />
            <FAQItem
              question="What happens if I exceed my document or request limits?"
              answer="We&apos;ll notify you when you approach your limit (at 80% and 95%). You can upgrade your plan or purchase additional capacity as needed. We never stop your service - we&apos;ll work with you to find the right solution."
            />
            <FAQItem
              question="Can I change plans later?"
              answer="Absolutely! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades take effect at the start of your next billing cycle. We&apos;ll prorate any changes fairly."
            />
            <FAQItem
              question="Do you offer annual billing?"
              answer="Yes, annual billing is available with a 20% discount on all platform plans. Contact our sales team for annual pricing on service packages and enterprise solutions."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards (Visa, Mastercard, Amex), ACH transfers, and wire transfers. Enterprise customers can request invoicing with NET 30 payment terms."
            />
            <FAQItem
              question="Is there a setup fee for platform plans?"
              answer="No setup fees for Starter or Professional platform plans - you can start using the platform immediately. Enterprise plans include custom onboarding and training, which is included in your custom pricing."
            />
            <FAQItem
              question="What kind of support is included?"
              answer="Starter includes email support (24-48hr response). Professional includes priority email and chat support (4-8hr response). Enterprise includes dedicated account manager, phone support, and 24/7 emergency support with SLA guarantees."
            />
            <FAQItem
              question="Can I combine multiple service packages?"
              answer="Yes! Many customers combine service packages. For example, you might get the Document Storage & Search setup plus the Monthly Support package. We&apos;ll create a custom bundle with package discounts for multiple services."
            />
            <FAQItem
              question="Do service packages require a platform subscription?"
              answer="Some service packages work standalone (like Document Storage), while others require an active platform subscription (like Full Business Automation). Our team will recommend the right combination for your needs during consultation."
            />
            <FAQItem
              question="What happens after the 30-day post-launch support?"
              answer="After the initial 30 days included with service packages, you can add our Monthly Support & Improvements package ($450/mo) for ongoing maintenance, optimizations, and new feature additions."
            />
            <FAQItem
              question="Is my data secure?"
              answer="Yes. All plans include enterprise-grade security: data encryption at rest and in transit, regular automated backups, SOC 2 compliance, GDPR compliance, and optional HIPAA compliance for healthcare customers."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-astralis-navy to-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Start your free trial today and experience the power of AI-driven automation. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact?intent=trial"
              className="bg-astralis-blue hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              Start 14-Day Free Trial
            </a>
            <Link
              href="/contact"
              className="border-2 border-white hover:bg-white hover:text-astralis-navy text-white px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              Schedule Consultation
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-400">
            Questions? Call us at (555) 123-4567 or email sales@astralisone.com
          </p>
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
                <li><Link href="/services">Services</Link></li>
                <li><Link href="/solutions">Solutions</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="https://app.astralisone.com/auth/signin">Sign In</a></li>
                <li><a href="https://app.astralisone.com/auth/signup">Sign Up</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2024 Astralis One. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaLink: string;
  highlighted?: boolean;
}

function PricingCard({
  title,
  price,
  period,
  description,
  features,
  cta,
  ctaLink,
  highlighted = false,
}: PricingCardProps) {
  return (
    <div
      className={`bg-white border rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow ${
        highlighted ? 'ring-2 ring-astralis-blue' : ''
      }`}
    >
      {highlighted && (
        <div className="bg-astralis-blue text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold mb-2 text-astralis-navy">{title}</h3>
      <div className="mb-4">
        <span className="text-4xl font-bold text-astralis-navy">{price}</span>
        {price !== 'Custom' && <span className="text-gray-600"> /{period}</span>}
        {price === 'Custom' && <span className="text-gray-600 text-lg"> {period}</span>}
      </div>
      <p className="text-gray-600 mb-6">{description}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start">
            <span className="text-astralis-blue mr-2">✓</span>
            <span className="text-gray-600 text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <a
        href={ctaLink}
        className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition-colors ${
          highlighted
            ? 'bg-astralis-blue hover:bg-blue-700 text-white'
            : 'border border-astralis-blue text-astralis-blue hover:bg-astralis-blue hover:text-white'
        }`}
      >
        {cta}
      </a>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center">
      <span className="text-astralis-blue mr-2">✓</span>
      <span className="text-slate-600 text-sm">{text}</span>
    </div>
  );
}

interface ServicePackageCardProps {
  title: string;
  setupFee: string;
  monthlyFee: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

function ServicePackageCard({
  title,
  setupFee,
  monthlyFee,
  description,
  features,
  highlighted = false,
}: ServicePackageCardProps) {
  return (
    <div
      className={`bg-white border rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col ${
        highlighted ? 'ring-2 ring-astralis-blue border-astralis-blue' : 'border-slate-200'
      }`}
    >
      {highlighted && (
        <div className="bg-astralis-blue text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4 self-start">
          Most Popular
        </div>
      )}
      <h3 className="text-xl font-bold mb-3 text-astralis-navy">{title}</h3>
      <p className="text-slate-600 mb-4 text-sm flex-grow">{description}</p>

      <div className="mb-4 pb-4 border-b border-slate-200">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold text-astralis-navy">{setupFee}</span>
          <span className="text-sm text-slate-500">setup fee</span>
        </div>
        <div className="text-sm font-medium text-slate-700">
          + {monthlyFee}
        </div>
      </div>

      <ul className="space-y-2 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start text-sm">
            <span className="text-astralis-blue mr-2 mt-0.5">✓</span>
            <span className="text-slate-600">{feature}</span>
          </li>
        ))}
      </ul>

      <a
        href="/contact"
        className={`block w-full text-center px-4 py-2 rounded-lg font-semibold transition-colors mt-auto ${
          highlighted
            ? 'bg-astralis-blue hover:bg-blue-700 text-white'
            : 'border border-astralis-blue text-astralis-blue hover:bg-astralis-blue hover:text-white'
        }`}
      >
        Get Started
      </a>
    </div>
  );
}

function FeatureComparisonTable() {
  const features = [
    { name: 'AI Intake Routing', starter: '500/mo', professional: '5,000/mo', enterprise: 'Unlimited' },
    { name: 'Team Members', starter: '3', professional: '15', enterprise: 'Unlimited' },
    { name: 'Document Processing', starter: '100/mo', professional: '1,000/mo', enterprise: 'Unlimited' },
    { name: 'Active Pipelines', starter: '5', professional: 'Unlimited', enterprise: 'Unlimited' },
    { name: 'Scheduling Workflows', starter: 'Basic', professional: 'Advanced', enterprise: 'Custom' },
    { name: 'Workflow Builder', starter: '—', professional: 'Yes', enterprise: 'Yes' },
    { name: 'CRM Integrations', starter: '—', professional: 'Yes', enterprise: 'Yes' },
    { name: 'Custom AI Training', starter: '—', professional: '—', enterprise: 'Yes' },
    { name: 'API Access', starter: 'Limited', professional: 'Full', enterprise: 'Full' },
    { name: 'Support Level', starter: 'Email', professional: 'Priority', enterprise: '24/7' },
    { name: 'SLA Guarantee', starter: '—', professional: '—', enterprise: 'Yes' },
    { name: 'Dedicated Infrastructure', starter: '—', professional: '—', enterprise: 'Yes' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-astralis-navy text-white">
            <th className="px-6 py-4 text-left font-semibold">Feature</th>
            <th className="px-6 py-4 text-center font-semibold">Starter</th>
            <th className="px-6 py-4 text-center font-semibold">Professional</th>
            <th className="px-6 py-4 text-center font-semibold">Enterprise</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, idx) => (
            <tr
              key={idx}
              className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}
            >
              <td className="px-6 py-4 font-medium text-astralis-navy border-b border-slate-200">
                {feature.name}
              </td>
              <td className="px-6 py-4 text-center text-slate-600 border-b border-slate-200">
                {feature.starter}
              </td>
              <td className="px-6 py-4 text-center text-slate-600 border-b border-slate-200 bg-astralis-blue/5">
                {feature.professional}
              </td>
              <td className="px-6 py-4 text-center text-slate-600 border-b border-slate-200">
                {feature.enterprise}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-100">
            <td className="px-6 py-4 font-bold text-astralis-navy">Monthly Price</td>
            <td className="px-6 py-4 text-center font-bold text-astralis-navy">$99/mo</td>
            <td className="px-6 py-4 text-center font-bold text-astralis-navy bg-astralis-blue/5">$299/mo</td>
            <td className="px-6 py-4 text-center font-bold text-astralis-navy">Custom</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <h3 className="font-semibold text-astralis-navy mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}
