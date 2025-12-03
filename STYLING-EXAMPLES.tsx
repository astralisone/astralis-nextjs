/**
 * ASTRALIS STYLING EXAMPLES
 * Copy-paste ready code snippets matching reference images
 */

// ============================================
// IMAGE 1: Central AI Ring with Orbiting Icons
// ============================================

export const CentralAIRing = () => (
  <div className="min-h-screen bg-gradient-radial-dark particle-bg tech-grid flex items-center justify-center relative overflow-hidden">
    {/* Background effects */}
    <div className="overlay-radial-dark"></div>
    <div className="starfield"></div>

    {/* Central AI Ring */}
    <div className="relative z-10">
      <div className="ai-ring flex items-center justify-center">
        <span className="text-4xl font-bold text-white text-glow-cyan">AI</span>
      </div>

      {/* Orbiting Icons */}
      <div className="orbit-container">
        <div className="orbit-ring orbit-ring-1"></div>
        <div className="orbit-ring orbit-ring-2"></div>
        <div className="orbit-ring orbit-ring-3"></div>

        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="orbit-item">
            <div className="orbit-item-content">
              <div className="icon-circle animate-float">
                {/* Replace with actual icon */}
                <div className="w-6 h-6 bg-astralis-cyan/50 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Floating particles */}
    <div className="particle-system">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="particle"></div>
      ))}
    </div>
  </div>
);

// ============================================
// IMAGE 2: Landing Page Hero
// ============================================

export const LandingHero = () => (
  <div className="bg-astralis-navy particle-bg tech-grid">
    {/* Header */}
    <header className="border-b border-white/10">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-astralis-cyan rounded"></div>
          <span className="text-white font-semibold">Astralis</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-slate-300 hover:text-white">Services</a>
          <a href="#" className="text-slate-300 hover:text-white">Process</a>
          <a href="#" className="text-slate-300 hover:text-white">Case Studies</a>
          <button className="btn-glow-cyan">Free Strategy Session</button>
        </nav>
      </div>
    </header>

    {/* Hero Section */}
    <div className="container mx-auto px-6 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl lg:text-6xl font-bold text-white text-glow-white mb-6">
            AI-Driven Sales Automation: Elevate Conversion, Accelerate Growth
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Transform your sales intelligence with multi-input routing and streamlined
            AI-powered CRM updates.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="btn-glow-cyan">
              Launch Sales Autopilot
            </button>
            <button className="btn-outline-glow">
              Book a Demo
            </button>
          </div>
        </div>

        <div className="relative">
          {/* 3D Funnel Graphic Placeholder */}
          <div className="w-full h-96 bg-gradient-to-br from-astralis-cyan/20 to-astralis-blue/20 rounded-lg shadow-glow-cyan-lg animate-float-slow"></div>
        </div>
      </div>
    </div>

    {/* Stats Bar */}
    <div className="bg-astralis-navy/50 border-y border-white/10">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-wrap justify-between gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-astralis-cyan text-glow-cyan">278%</div>
            <div className="text-sm text-slate-300">Higher Lead Conversion</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">60%</div>
            <div className="text-sm text-slate-300">Reduced Cycle by 60%</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">30%</div>
            <div className="text-sm text-slate-300">Reduced Costs by 30%</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">+2.7 Hrs</div>
            <div className="text-sm text-slate-300">Saved +2.7 Hrs Daily</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================
// IMAGE 3: Marketplace with Constellation
// ============================================

export const MarketplaceHero = () => (
  <div className="min-h-screen bg-astralis-navy constellation-bg">
    {/* Header */}
    <header className="border-b border-white/10">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <span className="text-white font-semibold">
          <span className="text-astralis-cyan">AI</span> Marketplace
        </span>
        <nav className="flex items-center gap-6">
          <a href="#" className="text-slate-300 hover:text-white text-sm">Browse</a>
          <a href="#" className="text-slate-300 hover:text-white text-sm">Analytics</a>
          <a href="#" className="text-slate-300 hover:text-white text-sm">About</a>
          <button className="btn-outline-glow text-sm">Login</button>
        </nav>
      </div>
    </header>

    {/* Hero with Search */}
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="text-center max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-white text-glow-cyan mb-12">
          AI Marketplace
        </h1>

        {/* Glass Search Bar */}
        <div className="glass-search max-w-2xl mx-auto mb-12">
          <div className="flex items-center gap-3 px-4 py-3">
            <svg className="w-5 h-5 text-astralis-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none"
            />
          </div>
        </div>

        {/* Category Icons */}
        <div className="flex justify-center gap-8">
          {['Analytics', 'Operations', 'Customer Service', 'Marketing', 'Finance'].map((category) => (
            <div key={category} className="text-center">
              <div className="icon-circle mx-auto mb-2 cursor-pointer">
                <div className="w-6 h-6 bg-astralis-cyan/50 rounded"></div>
              </div>
              <span className="text-xs text-slate-300">{category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Floating tech icons */}
    <div className="particle-system">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="icon-circle animate-float-slow"
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        >
          <div className=" ui-icon w-5 h-5 bg-astralis-cyan/30 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

// ============================================
// IMAGE 4: Calendar with Lens Flare
// ============================================

export const CalendarSection = () => (
  <div className="min-h-screen bg-gradient-navy-to-light flex items-center justify-center relative overflow-hidden">
    {/* Overlay */}
    <div className="overlay-gradient-light"></div>

    {/* Particle stream */}
    <div className="particle-stream" style={{ top: '50%' }}></div>

    {/* Calendar with lens flare */}
    <div className="relative z-10 lens-flare">
      <div className="glass-card-light p-8 rounded-2xl">
        {/* Calendar Icon Placeholder */}
        <div className="w-40 h-40 mx-auto">
          <svg className="w-full h-full text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2} />
            <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} />
            <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} />
            <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
          </svg>
        </div>
      </div>
    </div>

    {/* Tech connections */}
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full">
        <line x1="20%" y1="50%" x2="40%" y2="50%" className="connection-line" stroke="rgba(0,212,255,0.3)" strokeWidth="2" />
        <line x1="60%" y1="50%" x2="80%" y2="50%" className="connection-line" stroke="rgba(0,212,255,0.3)" strokeWidth="2" />
      </svg>
    </div>
  </div>
);

// ============================================
// IMAGE 5: Marketplace Listing
// ============================================

export const MarketplaceListing = () => (
  <div className="bg-light-gradient min-h-screen">
    {/* Hero */}
    <div className="bg-astralis-navy particle-bg py-24">
      <div className="container mx-auto px-6">
        <h1 className="text-5xl font-bold text-white text-glow-white mb-6 text-center">
          The Astralis AI Marketplace
        </h1>
        <p className="text-xl text-slate-300 text-center mb-8">
          Your Hub for Intelligent Solutions Jobs
        </p>
        <div className="glass-search max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent text-white px-4 py-3 outline-none"
          />
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className="container mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <div className="content-card">
            <h3 className="font-semibold mb-4">The Offers</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-astralis-cyan" />
                <span className="text-sm">Category</span>
              </label>
              {/* More filters */}
            </div>
          </div>
        </div>

        {/* Solution Cards */}
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-semibold mb-6">Featured Solutions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="content-card">
                {/* Icon */}
                <div className="feature-icon mx-auto mb-4">
                  <div className="w-10 h-10 bg-astralis-cyan/50 rounded"></div>
                </div>

                {/* Badge */}
                <span className="badge-featured mb-3">Featured</span>

                {/* Title */}
                <h3 className="font-semibold mb-2">Solution Name</h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className=" ui-icon w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* CTA */}
                <button className="w-full btn-glow-blue text-sm">
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Bottom CTA */}
    <div className="bg-astralis-navy particle-bg py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Can't Find What You Need?
        </h2>

        {/* Process Flow */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="text-center">
            <div className="icon-circle mx-auto mb-3">
              <div className="w-6 h-6 bg-white/50 rounded"></div>
            </div>
            <p className="text-sm text-white">Step 1: Identify</p>
          </div>

          <div className="flow-arrow hidden md:block"></div>

          <div className="text-center">
            <div className="icon-circle mx-auto mb-3">
              <div className="w-6 h-6 bg-white/50 rounded"></div>
            </div>
            <p className="text-sm text-white">Step 2: Analyze</p>
          </div>

          <div className="flow-arrow hidden md:block"></div>

          <div className="text-center">
            <div className="icon-circle mx-auto mb-3">
              <div className="w-6 h-6 bg-white/50 rounded"></div>
            </div>
            <p className="text-sm text-white">Step 3: Build</p>
          </div>

          <div className="flow-arrow hidden md:block"></div>

          <div className="text-center">
            <div className="icon-circle mx-auto mb-3">
              <div className="w-6 h-6 bg-white/50 rounded"></div>
            </div>
            <p className="text-sm text-white">Step 4: Deploy</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <button className="btn-glow-cyan">
            Book Consultation
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ============================================
// Reusable Components
// ============================================

export const GlowButton = ({ children, variant = 'cyan' }: { children: React.ReactNode; variant?: 'cyan' | 'blue' }) => (
  <button className={variant === 'cyan' ? 'btn-glow-cyan' : 'btn-glow-blue'}>
    {children}
  </button>
);

export const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="content-card text-center">
    <div className="feature-icon mx-auto mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-slate-600">{description}</p>
  </div>
);

export const ProcessStep = ({ icon, label, index }: { icon: React.ReactNode; label: string; index: number }) => (
  <>
    <div className="text-center">
      <div className="icon-circle mx-auto mb-3">
        {icon}
      </div>
      <p className="text-sm font-medium">{label}</p>
    </div>
    {index < 3 && <div className="flow-arrow hidden md:block"></div>}
  </>
);

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="ring-loader"></div>
  </div>
);

export const LoadingDots = () => (
  <div className="dot-loader">
    <span></span>
    <span></span>
    <span></span>
  </div>
);
