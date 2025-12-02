# Astralis One - Comprehensive File Structure Documentation

## Project Overview
**Astralis One** is a multi-agent engineering platform built with Next.js 15, TypeScript, and Prisma. It provides enterprise-grade AI operations including booking systems, email notifications, analytics tracking, queue processing with BullMQ, and a comprehensive UI component library.

---

## Root Configuration Files

```
/Users/gadmin/Projects/astralis-nextjs/
├── package.json                           # Dependencies & scripts (Next 15, React 18, Prisma, BullMQ, OpenAI, Anthropic)
├── next.config.mjs                        # Next.js config - standalone output, SWC minifier, memory optimization
├── tsconfig.json                          # TypeScript strict mode, path alias (@/*), ES2020 target
├── tailwind.config.ts                     # Astralis brand theme: Navy (#0A1B2B), Cyan (#00D4FF), tech glows
├── ecosystem.config.js                    # PM2 process manager config (nextjs + worker processes)
├── .env.local.template                    # Environment variable reference (DB, Redis, SMTP, AI APIs, OAuth)
├── .dockerignore                          # Docker build exclusions
├── Dockerfile.nextjs                      # Multi-stage Docker build (builder + slim runner, standalone mode)
├── Dockerfile.prod                        # Production-optimized Docker image
├── Dockerfile.build                       # Separate build stage for pre-compilation
├── docker-compose-dev.yml                 # Dev environment: n8n workflow automation container
├── docker-entrypoint.sh                   # Container startup script (migrations + server)
├── Caddyfile                              # Caddy reverse proxy config (HTTPS, auto-certs)
├── playwright.config.ts                   # E2E testing configuration
├── .storybook/                            # Storybook UI component documentation
│   ├── main.ts                            # Storybook config (Next.js integration)
│   └── preview.ts                         # Global decorators and parameters
├── CLAUDE.md                              # AI assistant project instructions
├── README.md                              # Quick start guide
├── SETUP_GUIDE.md                         # Detailed setup instructions
└── STYLING-GUIDE.md                       # Brand design system reference
```

**Technical Notes:**
- **Next.js 15** with App Router, React Server Components, TypeScript strict mode
- **Port 3001** for development and production (to avoid conflicts with common services)
- **Standalone output** for Docker optimization (reduces image size by 70%)
- **PM2** manages both Next.js app and BullMQ worker as separate processes
- **Caddy** handles HTTPS termination and reverse proxy (production deployment)

---

## Source Code Structure (`src/`)

### App Router Pages (`src/app/`)

```
src/app/
├── (app)/                                 # Protected app routes (authenticated users only)
│   ├── layout.tsx                         # Dashboard layout wrapper with sidebar + header
│   ├── dashboard/page.tsx                 # Main dashboard: metrics, activity feed, kanban preview
│   ├── automations/                       # n8n workflow automation management
│   │   ├── page.tsx                       # Automation list view
│   │   ├── [id]/page.tsx                  # Automation detail & execution history
│   │   ├── [id]/edit/page.tsx             # Visual workflow editor
│   │   ├── new/page.tsx                   # Create new automation
│   │   └── templates/page.tsx             # Pre-built automation templates
│   ├── calendar-chat/page.tsx             # AI scheduling chat interface (natural language)
│   ├── documents/page.tsx                 # Document upload, OCR, RAG chat (Phase 4)
│   ├── intake/page.tsx                    # Intake request management (AI routing)
│   ├── intakes/[id]/page.tsx              # Intake detail view
│   ├── integrations/page.tsx              # OAuth integrations (Google, Slack, etc.)
│   ├── pipelines/                         # Kanban pipeline management
│   │   ├── page.tsx                       # All pipelines list
│   │   └── [id]/page.tsx                  # Pipeline detail (drag-and-drop kanban)
│   ├── scheduling/page.tsx                # Calendar & event management
│   └── settings/                          # User & org settings
│       ├── page.tsx                       # General settings
│       ├── profile/page.tsx               # User profile editor
│       └── preferences/page.tsx           # Notification & timezone preferences
│
├── (marketing)/                           # Public marketing pages (no auth required)
│   ├── about/page.tsx                     # Company information
│   ├── blog/page.tsx                      # Blog posts listing
│   ├── contact/page.tsx                   # Contact form
│   ├── marketplace/page.tsx               # Solutions marketplace
│   └── services/page.tsx                  # Service offerings
│
├── api/                                   # REST API endpoints (Next.js Route Handlers)
│   ├── agent/                             # Orchestration agent endpoints (LLM-powered decisions)
│   │   ├── analytics/route.ts             # Agent performance metrics
│   │   ├── availability/route.ts          # Agent availability status
│   │   ├── config/route.ts                # Agent configuration management
│   │   ├── decisions/                     # Agent decision tracking
│   │   │   ├── route.ts                   # List all decisions
│   │   │   └── [id]/                      # Decision CRUD operations
│   │   │       ├── approve/route.ts       # Approve pending decision
│   │   │       ├── reject/route.ts        # Reject decision
│   │   │       └── route.ts               # Get/update decision
│   │   ├── inbox/route.ts                 # Agent task inbox
│   │   ├── init/route.ts                  # Initialize agent for org
│   │   ├── process/route.ts               # Process new input
│   │   └── suggest/route.ts               # Get AI suggestions
│   │
│   ├── auth/                              # Authentication endpoints (NextAuth.js)
│   │   ├── [...nextauth]/route.ts         # NextAuth handler (all auth routes)
│   │   ├── accept-invite/route.ts         # Accept org invitation
│   │   ├── resend-verification/route.ts   # Resend email verification
│   │   └── signup/route.ts                # User registration
│   │
│   ├── automations/                       # Automation workflow APIs
│   │   ├── route.ts                       # List/create automations
│   │   ├── [id]/route.ts                  # Get/update/delete automation
│   │   ├── [id]/execute/route.ts          # Trigger automation manually
│   │   ├── [id]/executions/route.ts       # Execution history
│   │   ├── [id]/workflow/route.ts         # n8n workflow sync
│   │   └── templates/                     # Automation templates
│   │       ├── route.ts                   # List templates
│   │       └── [id]/deploy/route.ts       # Deploy template to org
│   │
│   ├── booking/                           # Public booking system
│   │   ├── route.ts                       # Create booking
│   │   ├── availability/route.ts          # Check availability
│   │   └── events/route.ts                # Get booked events
│   │
│   ├── calendar/                          # Calendar integration APIs
│   │   ├── connect/route.ts               # OAuth connect to Google Calendar
│   │   ├── callback/route.ts              # OAuth callback handler
│   │   ├── disconnect/route.ts            # Disconnect calendar
│   │   ├── sync/route.ts                  # Sync events from provider
│   │   └── events/                        # Event management
│   │       ├── route.ts                   # List/create events
│   │       └── [id]/route.ts              # Get/update/delete event
│   │
│   ├── chat/                              # AI chat endpoints (RAG + calendar)
│   │   ├── route.ts                       # Chat with documents (RAG)
│   │   ├── [id]/route.ts                  # Get chat history
│   │   └── calendar/route.ts              # Calendar-specific chat
│   │
│   ├── documents/                         # Document processing APIs
│   │   ├── route.ts                       # List/create documents
│   │   ├── upload/route.ts                # File upload to DigitalOcean Spaces
│   │   ├── search/route.ts                # Vector similarity search
│   │   ├── stats/route.ts                 # Document processing stats
│   │   └── [id]/                          # Document operations
│   │       ├── route.ts                   # Get/delete document
│   │       ├── download/route.ts          # Download original file
│   │       ├── embed/route.ts             # Generate embeddings
│   │       ├── retry/route.ts             # Retry failed processing
│   │       └── url/route.ts               # Get presigned URL
│   │
│   ├── intake/                            # Intake request APIs (AI routing)
│   │   ├── route.ts                       # List/create intakes
│   │   ├── bulk/route.ts                  # Bulk operations
│   │   └── [id]/                          # Intake operations
│   │       ├── route.ts                   # Get/update intake
│   │       └── assign/route.ts            # Assign to pipeline
│   │
│   ├── integrations/                      # Third-party integrations
│   │   ├── route.ts                       # List integrations
│   │   └── [provider]/                    # Provider-specific
│   │       ├── oauth/callback/route.ts    # OAuth callback
│   │       └── [id]/route.ts              # Credential CRUD
│   │
│   ├── pipelines/                         # Pipeline management APIs
│   │   ├── route.ts                       # List/create pipelines
│   │   └── [id]/                          # Pipeline operations
│   │       ├── route.ts                   # Get/update/delete pipeline
│   │       ├── items/                     # Pipeline items (cards)
│   │       │   ├── route.ts               # List/create items
│   │       │   └── [itemId]/              # Item operations
│   │       │       ├── route.ts           # Get/update/delete item
│   │       │       └── move/route.ts      # Move item to stage
│   │       └── stages/                    # Pipeline stages (columns)
│   │           ├── route.ts               # List/create stages
│   │           └── [stageId]/route.ts     # Stage operations
│   │
│   ├── scheduling/                        # AI scheduling endpoints
│   │   ├── conflicts/route.ts             # Detect scheduling conflicts
│   │   └── suggest/route.ts               # AI-suggested time slots
│   │
│   ├── tasks/                             # Agentic task system
│   │   ├── route.ts                       # List/create tasks
│   │   └── [id]/                          # Task operations
│   │       ├── route.ts                   # Get/update task
│   │       ├── override/route.ts          # Human override decision
│   │       └── reprocess/route.ts         # Reprocess with agent
│   │
│   ├── dashboard/stats/route.ts           # Dashboard metrics
│   ├── health/route.ts                    # Health check endpoint
│   └── organization/quota/route.ts        # Quota tracking (plan limits)
│
├── auth/                                  # Authentication pages (custom NextAuth UI)
│   ├── signin/page.tsx                    # Email/password login
│   ├── signup/page.tsx                    # User registration form
│   ├── verify-email/page.tsx              # Email verification
│   ├── reset-password/page.tsx            # Password reset flow
│   └── error/page.tsx                     # Auth error handling
│
├── layout.tsx                             # Root layout (global providers, fonts)
├── page.tsx                               # Homepage (marketing landing page)
├── globals.css                            # Global Tailwind styles + CSS variables
└── favicon.ico                            # Site favicon
```

**Functional Purpose:**
- **App Router** enables React Server Components, streaming, and co-located data fetching
- **(app)** route group applies authentication middleware to all child routes
- **(marketing)** route group allows public access without authentication
- **API routes** use Next.js Route Handlers (supersedes older Pages Router API routes)
- **Parallel routing** structure supports multi-layout patterns

**Technical Notes:**
- All API routes validate inputs with **Zod schemas** (see `src/lib/validators/`)
- **Server Components** by default; Client Components marked with `'use client'`
- **NextAuth.js** handles authentication with Prisma adapter
- **React Query** (`@tanstack/react-query`) for data fetching/caching in client components

---

### UI Components (`src/components/`)

```
src/components/
├── ui/                                    # Radix UI primitives + Astralis styling
│   ├── accordion.tsx                      # Collapsible content sections
│   ├── alert-dialog.tsx                   # Modal confirmations
│   ├── avatar.tsx                         # User profile images
│   ├── badge.tsx                          # Status indicators
│   ├── button.tsx                         # Primary UI button (variants: default, outline, ghost)
│   ├── card.tsx                           # Container with shadow/border
│   ├── checkbox.tsx                       # Form checkbox
│   ├── dialog.tsx                         # Modal dialogs
│   ├── dropdown-menu.tsx                  # Dropdown menus
│   ├── form.tsx                           # React Hook Form wrapper
│   ├── input.tsx                          # Text input fields
│   ├── label.tsx                          # Form labels
│   ├── select.tsx                         # Dropdown select
│   ├── separator.tsx                      # Horizontal/vertical divider
│   ├── slider.tsx                         # Range slider
│   ├── tabs.tsx                           # Tab navigation
│   ├── toast.tsx                          # Toast notifications
│   └── tooltip.tsx                        # Hover tooltips
│
├── analytics/
│   └── GoogleAnalytics.tsx                # GA4 tracking component
│
├── auth/
│   └── AuthLayout.tsx                     # Auth pages layout wrapper
│
├── automations/                           # Automation workflow components
│   ├── AutomationCard.tsx                 # Automation list item
│   ├── AutomationList.tsx                 # Automation grid view
│   ├── ExecutionDetailModal.tsx           # Execution log viewer
│   ├── ExecutionHistory.tsx               # Execution timeline
│   ├── IntegrationSetup.tsx               # OAuth credential setup
│   ├── TemplateCard.tsx                   # Template preview card
│   ├── TriggerConfig.tsx                  # Trigger configuration form
│   └── WorkflowEditor.tsx                 # Visual workflow builder (n8n integration)
│
├── booking/
│   ├── BookingModal.tsx                   # Public booking form modal
│   └── step-wizard.tsx                    # Multi-step booking wizard
│
├── calendar/                              # Calendar & scheduling components
│   ├── AvailabilityEditor.tsx             # Set availability rules
│   ├── CalendarChatPanel.tsx              # Natural language scheduling chat
│   ├── CalendarConnectionCard.tsx         # Calendar provider card
│   ├── CalendarView.tsx                   # FullCalendar component
│   ├── ConflictDetector.tsx               # Visual conflict warnings
│   ├── EventCard.tsx                      # Event list item
│   ├── EventForm.tsx                      # Create/edit event form
│   ├── ReminderSettings.tsx               # Reminder configuration
│   └── TimeSlotSuggestions.tsx            # AI-suggested time slots
│
├── dashboard/                             # Dashboard widgets
│   ├── ActivityFeed.tsx                   # Recent activity timeline
│   ├── IntakeQueueTable.tsx               # Intake requests table
│   ├── KanbanBoard.tsx                    # Pipeline preview board
│   ├── KanbanCard.tsx                     # Pipeline item card
│   ├── KanbanColumn.tsx                   # Pipeline stage column
│   ├── MetricsCard.tsx                    # Stat card widget
│   ├── QuickActions.tsx                   # Quick action buttons
│   ├── RecentPipelinesTable.tsx           # Pipeline summary table
│   └── StatsWidget.tsx                    # Numeric stat display
│
├── documents/                             # Document processing UI
│   ├── DocumentCard.tsx                   # Document list item
│   ├── DocumentChat.tsx                   # RAG chat interface
│   ├── DocumentUploader.tsx               # Drag-and-drop file upload
│   └── DocumentViewer.tsx                 # PDF/image viewer
│
├── effects/                               # Visual effects (brand style)
│   ├── ConstellationBackground.tsx        # Animated particle network
│   ├── LensFlare.tsx                      # Light flare effect
│   ├── ParticleField.tsx                  # Floating particles
│   └── PulsingRing.tsx                    # Animated ring glow
│
├── intake/                                # Intake request components
│   ├── BulkActionsToolbar.tsx             # Bulk operations UI
│   ├── CreateIntakeModal.tsx              # New intake form
│   ├── IntakeCard.tsx                     # Intake card view
│   ├── IntakeDetailDrawer.tsx             # Intake detail panel
│   ├── IntakeStatusBadge.tsx              # Status indicator
│   ├── IntakeTable.tsx                    # Intake data table
│   └── PriorityIndicator.tsx              # Priority level display
│
├── interactive/                           # Interactive marketing components
│   ├── AnimatedBarChart.tsx               # Animated chart visualization
│   ├── FloatingIcons.tsx                  # Floating tech icons
│   ├── OrbitalIcons.tsx                   # Orbiting icons animation
│   └── roi-calculator.tsx                 # ROI calculator widget
│
├── layout/                                # Layout components
│   ├── DashboardHeader.tsx                # App header with user menu
│   ├── DashboardLayoutClient.tsx          # Client-side layout wrapper
│   ├── DashboardSidebar.tsx               # Main navigation sidebar
│   ├── EmptyState.tsx                     # Empty state placeholder
│   ├── OrgSwitcher.tsx                    # Organization switcher dropdown
│   ├── PageContainer.tsx                  # Page content wrapper
│   ├── PageHeader.tsx                     # Page title + actions
│   ├── footer.tsx                         # Marketing site footer
│   └── navigation.tsx                     # Marketing site nav
│
├── marketplace/                           # Marketplace components
│   ├── filter-sidebar.tsx                 # Product filter sidebar
│   ├── marketplace-search.tsx             # Search input
│   └── solution-card.tsx                  # Product card
│
├── pipelines/                             # Pipeline management UI
│   ├── CreateItemModal.tsx                # New item form
│   ├── CreatePipelineModal.tsx            # New pipeline form
│   ├── KanbanBoard.tsx                    # Drag-and-drop kanban
│   ├── KanbanColumn.tsx                   # Pipeline stage column
│   ├── PipelineFilters.tsx                # Filter/search controls
│   ├── StageManager.tsx                   # Stage CRUD UI
│   └── UnifiedKanbanCard.tsx              # Unified task/item card
│
├── scheduling/                            # Public scheduling UI
│   ├── AvailabilityDisplay.tsx            # Available time slots
│   └── PublicBookingForm.tsx              # Public-facing booking form
│
└── sections/                              # Marketing page sections
    ├── HomepageCapabilities.tsx           # Feature showcase
    ├── HomepageProcessFlow.tsx            # Process diagram
    ├── HomepageStatsBar.tsx               # Stats banner
    ├── case-study-card.tsx                # Case study card
    ├── cta-section.tsx                    # Call-to-action section
    ├── feature-card-icon.tsx              # Feature card with icon
    ├── feature-grid.tsx                   # Feature grid layout
    ├── hero-3d-hexagon.tsx                # 3D hero graphic
    ├── hero-with-graphic.tsx              # Hero section
    ├── pricing-card.tsx                   # Pricing tier card
    ├── solution-showcase.tsx              # Solution preview
    └── testimonial-slider.tsx             # Testimonials carousel
```

**Functional Purpose:**
- **ui/** contains reusable Radix UI primitives styled with Tailwind (Astralis brand theme)
- **Storybook integration** - most components have `.stories.tsx` files for documentation
- **Client components** - most UI components are client-side rendered
- **Server components** - layout wrappers and data-fetching components use Server Components

**Technical Notes:**
- **Radix UI** provides accessible, unstyled primitives
- **class-variance-authority (CVA)** for component variant management
- **Tailwind CSS** for styling with Astralis brand tokens
- **Lucide React** for icon library

---

### Services & Business Logic (`src/lib/`)

```
src/lib/
├── agent/                                 # Orchestration agent system (LLM-powered)
│   ├── core/                              # Core agent logic
│   │   ├── OrchestrationAgent.ts          # Main agent orchestrator
│   │   ├── DecisionEngine.ts              # LLM decision-making logic
│   │   ├── ActionExecutor.ts              # Execute agent actions
│   │   ├── TaskActionExecutor.ts          # Task-specific actions
│   │   ├── BaseTaskAgent.ts               # Base task agent class
│   │   ├── LLMFactory.ts                  # LLM client factory (OpenAI/Claude)
│   │   ├── LLMClient.ts                   # Abstract LLM client
│   │   ├── OpenAIClient.ts                # OpenAI API client
│   │   └── ClaudeClient.ts                # Anthropic Claude client
│   │
│   ├── actions/                           # Agent action implementations
│   │   ├── PipelineAssigner.ts            # Assign intake to pipeline
│   │   ├── CalendarManager.ts             # Calendar event actions
│   │   ├── NotificationDispatcher.ts      # Send notifications
│   │   └── AutomationTrigger.ts           # Trigger n8n workflows
│   │
│   ├── inputs/                            # Input handlers (events → agent)
│   │   ├── BaseInputHandler.ts            # Abstract input handler
│   │   ├── EmailInputHandler.ts           # Email-triggered actions
│   │   ├── WebhookInputHandler.ts         # Webhook-triggered actions
│   │   ├── DBTriggerHandler.ts            # Database event triggers
│   │   ├── WorkerEventHandler.ts          # Worker queue events
│   │   └── EventBus.ts                    # Event bus for async events
│   │
│   ├── prompts/                           # LLM system prompts
│   │   ├── system-prompt.ts               # Base system prompt
│   │   ├── intake-routing.ts              # Intake routing prompt
│   │   ├── scheduling.ts                  # Scheduling prompt
│   │   ├── notification.ts                # Notification prompt
│   │   └── base-task-agent.ts             # Task agent prompt
│   │
│   ├── services/
│   │   └── SLAMonitorService.ts           # SLA breach monitoring
│   │
│   ├── types/
│   │   └── agent.types.ts                 # Agent TypeScript types
│   │
│   └── webhooks/                          # Webhook utilities
│       └── utils.ts                       # Webhook verification
│
├── services/                              # Business logic services
│   ├── aiRouting.service.ts               # AI-powered intake routing
│   ├── aiScheduling.service.ts            # AI scheduling suggestions
│   ├── auth.service.ts                    # Authentication helpers
│   ├── automation.service.ts              # Automation workflow management
│   ├── calendarChat.service.ts            # Calendar chat AI logic
│   ├── chat.service.ts                    # Document chat (RAG)
│   ├── chat-response.service.ts           # Chat response formatting
│   ├── conflict.service.ts                # Calendar conflict detection
│   ├── defaultPipelines.service.ts        # Create default pipelines
│   ├── document.service.ts                # Document processing
│   ├── embedding.service.ts               # OpenAI embeddings generation
│   ├── googleCalendar.service.ts          # Google Calendar OAuth
│   ├── integration.service.ts             # OAuth integration management
│   ├── n8n.service.ts                     # n8n API client
│   ├── ocr.service.ts                     # Tesseract.js OCR processing
│   ├── orgSettings.service.ts             # Organization settings
│   ├── quota.service.ts                   # Quota enforcement
│   ├── quotaTracking.service.ts           # Quota usage tracking
│   ├── scheduling.service.ts              # Event scheduling logic
│   ├── schedulingAgent.service.ts         # Scheduling agent AI
│   ├── sms.service.ts                     # Twilio SMS (disabled by default)
│   ├── spaces.service.ts                  # DigitalOcean Spaces (S3 client)
│   ├── userProfile.service.ts             # User profile management
│   ├── userSettings.service.ts            # User settings
│   ├── vector-search.service.ts           # Vector similarity search
│   ├── vision.service.ts                  # OpenAI Vision API
│   └── webhook.service.ts                 # Webhook signature verification
│
├── validators/                            # Zod validation schemas
│   ├── auth.validators.ts                 # Auth endpoint schemas
│   ├── automation.validators.ts           # Automation endpoint schemas
│   ├── chat.validators.ts                 # Chat endpoint schemas
│   ├── document.validators.ts             # Document endpoint schemas
│   └── userProfile.validators.ts          # User profile schemas
│
├── analytics/
│   ├── gtag.ts                            # Google Analytics helper
│   └── index.ts                           # Analytics exports
│
├── auth/
│   └── config.ts                          # NextAuth configuration
│
├── events/                                # Event system
│   ├── taskEvents.ts                      # Task event emitter
│   └── types.ts                           # Event type definitions
│
├── middleware/
│   └── rbac.middleware.ts                 # Role-based access control
│
├── queries/                               # React Query helpers
│   ├── optimistic-updates.ts              # Optimistic UI updates
│   └── error-handling.ts                  # Query error handlers
│
├── utils/                                 # Utility functions
│   ├── crypto.ts                          # Encryption helpers
│   ├── email-templates.ts                 # Email HTML templates
│   ├── embedding-helper.ts                # Embedding utilities
│   ├── file-validation.ts                 # File type validation
│   └── webhook-verification.ts            # Webhook HMAC verification
│
├── api-registry.ts                        # API endpoint registry
├── calendar.ts                            # Calendar utilities
├── email.ts                               # Nodemailer SMTP client
├── prisma.ts                              # Prisma client singleton
├── query-keys.ts                          # React Query key factory
├── server-only-imports.ts                 # Server-only module guard
└── utils.ts                               # General utilities (cn, formatters)
```

**Functional Purpose:**
- **agent/** - LLM-powered orchestration system for autonomous decision-making
- **services/** - Business logic layer (called by API routes and workers)
- **validators/** - Input validation with Zod (type-safe runtime validation)
- **utils/** - Shared utility functions

**Technical Notes:**
- **OpenAI API** for embeddings (text-embedding-3-small) and chat (gpt-4-turbo)
- **Anthropic Claude** for complex reasoning tasks (Claude Sonnet 4.5)
- **Prisma Client** singleton pattern prevents connection pool exhaustion
- **Server-only imports** enforced with `server-only` package

---

### Background Workers (`src/workers/`)

```
src/workers/
├── index.ts                               # Worker process entry point (BullMQ + Redis)
├── redis.ts                               # IORedis connection singleton
│
├── queues/                                # BullMQ queue definitions
│   ├── document-processing.queue.ts       # Document OCR queue
│   ├── document-embedding.queue.ts        # Embedding generation queue
│   ├── intakeRouting.queue.ts             # AI routing queue
│   ├── calendarSync.queue.ts              # Calendar sync queue
│   ├── schedulingAgent.queue.ts           # Scheduling agent queue
│   ├── schedulingReminders.queue.ts       # Event reminder queue
│   └── sla-monitor.queue.ts               # SLA monitoring queue
│
├── processors/                            # Queue job processors
│   ├── ocr.processor.ts                   # Tesseract.js OCR processing
│   ├── embedding.processor.ts             # OpenAI embedding generation
│   ├── intakeRouting.processor.ts         # AI intake routing
│   ├── calendarSync.processor.ts          # Google Calendar sync
│   ├── schedulingAgent.processor.ts       # AI scheduling processing
│   ├── schedulingReminder.processor.ts    # Send event reminders
│   └── slaMonitor.processor.ts            # Monitor SLA breaches
│
└── jobs/
    └── sla-monitor.job.ts                 # SLA monitoring job definition
```

**Functional Purpose:**
- **Async background processing** for CPU-intensive tasks (OCR, embeddings)
- **Reliable job execution** with retry logic and error handling
- **Decoupled architecture** - API routes enqueue jobs, workers process them

**Technical Notes:**
- **BullMQ** (Redis-backed queue) for job processing
- **IORedis** for Redis connection (separate from Next.js app)
- **Graceful shutdown** handling in worker process
- **PM2** manages worker process independently from Next.js app

---

## Database Layer

### Prisma Schema (`prisma/`)

```
prisma/
├── schema.prisma                          # Complete data model (100+ tables)
│   ├── Core Models                        # User, Organization, Session, Account
│   ├── Pipeline System                    # Pipeline, PipelineStage, PipelineItem
│   ├── Agentic Task System                # Task, TaskTemplate, DecisionLog
│   ├── Automation                         # Automation, WorkflowExecution, WorkflowTrigger
│   ├── Documents                          # Document, DocumentEmbedding, DocumentChat
│   ├── Calendar                           # SchedulingEvent, EventReminder, AvailabilityRule
│   ├── Intake                             # IntakeRequest (AI routing)
│   ├── Booking                            # AuditBookings, Consultations
│   ├── Marketplace                        # MarketplaceItems, Orders
│   ├── CMS                                # Posts, Categories, Tags
│   └── Agent System                       # OrchestrationAgent, AgentDecision
│
├── migrations/                            # Database migration history
│   ├── 20251120110713_add_phase1_auth_models/
│   ├── 20251120223229_add_document_model/
│   ├── 20251121093830_add_automation_tables_phase_6/
│   ├── 20251124104022_add_org_slug/
│   ├── 20251126000000_add_chat_messages/
│   ├── 20251126000001_add_plan_type_and_quota/
│   ├── 20251126000002_add_timezone_to_users/
│   ├── 20251126000003_add_pipeline_key_and_type/
│   └── migration_lock.toml
│
├── seed.ts                                # Database seeding script
├── seed.js                                # JavaScript seed runner
├── seed-templates.ts                      # Seed automation templates
└── seeds/                                 # Seed data modules
    ├── pipelines.seed.ts                  # Seed default pipelines
    └── task-templates.seed.ts             # Seed task templates
```

**Functional Purpose:**
- **Multi-tenant architecture** - Organization-scoped data isolation
- **RBAC** - Role-based access (ADMIN, OPERATOR, CLIENT, PM)
- **Audit trail** - ActivityLog, AuditLog for compliance
- **Soft deletes** - Cascade deletes with onDelete rules

**Technical Notes:**
- **PostgreSQL** database (production)
- **Prisma ORM** with full TypeScript type generation
- **Optimized indexes** on frequently queried fields
- **Compound unique constraints** for data integrity
- **JSON fields** for flexible metadata storage

---

## Testing Infrastructure

### End-to-End Tests (`tests/`)

```
tests/
├── e2e/                                   # Playwright E2E tests
│   ├── auth/                              # Authentication flows
│   │   ├── signin.spec.ts                 # Login flow
│   │   ├── signup.spec.ts                 # Registration flow
│   │   ├── email-verification.spec.ts     # Email verification
│   │   ├── password-reset.spec.ts         # Password reset
│   │   └── protected-routes.spec.ts       # Route protection
│   │
│   ├── fixtures/                          # Test helpers
│   │   ├── auth.ts                        # Auth test fixtures
│   │   └── database.ts                    # DB test helpers
│   │
│   └── utils/                             # Test utilities
│       ├── db-helpers.ts                  # Database utilities
│       └── test-helpers.ts                # General test helpers
│
└── README.md                              # Testing documentation
```

**Functional Purpose:**
- **Playwright tests** for critical user flows
- **Database fixtures** for test data setup
- **Auth helpers** for authenticated test scenarios

**Technical Notes:**
- **Playwright** (headless browser testing)
- **Test database** isolation (separate from dev/prod)
- **Visual regression** support (screenshot comparisons)

---

## Documentation (`docs/`)

```
docs/
├── phases/                                # Phase planning documents
│   ├── README.md                          # Phase overview
│   ├── PROGRESS.md                        # Current progress tracking
│   ├── phase-1-authentication-rbac.md     # Phase 1: Auth & RBAC
│   ├── phase-2-dashboard-ui-pipelines.md  # Phase 2: Dashboard
│   ├── phase-3-ai-routing-background-jobs.md  # Phase 3: AI Routing
│   ├── phase-4-document-processing-ocr.md # Phase 4: Documents
│   ├── phase-5-integrations-unified-sync.md   # Phase 5: Integrations
│   ├── phase-6-automation.md              # Phase 6: Automation
│   ├── phase-7-cleanup-refactor.md        # Phase 7: Cleanup
│   ├── phase-8-production-deployment.md   # Phase 8: Deployment
│   └── phase-9-ai-intake-routing.md       # Phase 9: AI Routing
│
├── API_ROUTES_*.md                        # API documentation
│   ├── API_ROUTES_AGENTS.md               # Agent endpoints
│   ├── API_ROUTES_CALENDAR_SCHEDULING.md  # Calendar endpoints
│   ├── API_ROUTES_DOCUMENTS.md            # Document endpoints
│   ├── API_ROUTES_PHASE_6_AUTOMATION.md   # Automation endpoints
│   └── API_ROUTES_PIPELINES.md            # Pipeline endpoints
│
├── DOCKER_*.md                            # Docker guides
│   ├── DOCKER_ARCHITECTURE_COMPARISON.md  # Docker architecture options
│   ├── DOCKER_OPTIMIZATION_GUIDE.md       # Optimization strategies
│   └── DOCKER_QUICK_START.md              # Quick start guide
│
├── CADDY_*.md                             # Caddy reverse proxy docs
│   ├── CADDY_SETUP.md                     # Setup instructions
│   ├── CADDY_QUICK_REFERENCE.md           # Quick reference
│   └── CADDY_ARCHITECTURE.md              # Architecture overview
│
├── BOOKING_SETUP.md                       # Email booking setup
├── CALENDAR_CHAT.md                       # Calendar chat feature
├── CHAT_API_RAG_IMPLEMENTATION.md         # RAG chat implementation
├── COMPONENT_LIBRARY.md                   # UI component reference
├── CREDENTIAL_STORAGE_GUIDE.md            # OAuth credential storage
├── DEPLOYMENT.md                          # Production deployment
├── EMBEDDING_SERVICE.md                   # Embedding service guide
├── MULTI_AGENT_SYSTEM.md                  # Agent system architecture
├── STATE_MANAGEMENT.md                    # State management patterns
├── SENTRY_SETUP.md                        # Error monitoring setup
└── WEBHOOK_VERIFICATION.md                # Webhook security
```

**Functional Purpose:**
- **API documentation** for all endpoints
- **Architecture guides** for major systems
- **Deployment guides** for production setup
- **Phase documentation** tracks development progress

---

## Scripts & Deployment (`scripts/`)

```
scripts/
├── deploy.sh                              # Full production deployment script
├── deploy-docker.sh                       # Docker deployment
├── deploy-prebuilt.sh                     # Deploy prebuilt image
├── quick-deploy.sh                        # Quick deployment (no tests)
├── setup-phase6.sh                        # Phase 6 setup script
├── setup-caddy.sh                         # Caddy reverse proxy setup
├── create-test-user.ts                    # Create test user (dev)
├── fix-test-user-orgid.ts                 # Fix test user org ID
├── verify-session-fix.ts                  # Verify session fix
├── test-password.js                       # Test password hashing
├── update-openai-key.sh                   # Update OpenAI API key
└── init-n8n-schema.sql                    # n8n schema initialization
```

**Functional Purpose:**
- **Automated deployment** to production server (DigitalOcean)
- **Database utilities** for seeding and testing
- **Setup scripts** for infrastructure components

**Technical Notes:**
- **SSH deployment** to root@137.184.31.207
- **PM2 process management** for zero-downtime reloads
- **Git-based deployment** (pull from main branch)

---

## Agent System Architecture (`.claude/`)

```
.claude/
├── agents/                                # AI agent definitions (Claude Code)
│   ├── astralis-orchestrator.md           # Meta-orchestrator agent
│   ├── automation.md                      # Automation agent
│   ├── backend-api.md                     # Backend API agent
│   ├── brand-consistency.md               # Brand consistency agent
│   ├── content-writer.md                  # Content writer agent
│   ├── deployment.md                      # Deployment agent
│   ├── documentation.md                   # Documentation agent
│   ├── frontend-ui.md                     # Frontend UI agent
│   ├── marketplace-packaging.md           # Marketplace packaging agent
│   ├── product-owner.md                   # Product owner agent
│   ├── qa.md                              # QA agent
│   └── systems-architect.md               # Systems architect agent
│
├── commands/                              # Agent commands
│   ├── deploy.md                          # Deploy command
│   ├── execute.md                         # Execute command
│   └── fix-bugs.md                        # Fix bugs command
│
└── AGENT_QUICK_REFERENCE.md               # Agent system reference
```

**Functional Purpose:**
- **Multi-agent development** system for coordinated AI assistance
- **Specialized agents** for different aspects of development
- **Command-based workflows** for common tasks

---

## Key Dependencies & Technologies

### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 15.5.6 | React framework with App Router |
| React | 18.3.1 | UI library |
| TypeScript | 5.9.3 | Type-safe development |

### Database & ORM
| Package | Version | Purpose |
|---------|---------|---------|
| Prisma | 5.22.0 | Database ORM |
| PostgreSQL | - | Production database |

### Authentication
| Package | Version | Purpose |
|---------|---------|---------|
| NextAuth.js | 4.24.13 | Authentication |
| bcryptjs | - | Password hashing |

### Background Processing
| Package | Version | Purpose |
|---------|---------|---------|
| BullMQ | 5.64.0 | Job queue |
| IORedis | 5.8.2 | Redis client |

### AI & ML
| Package | Version | Purpose |
|---------|---------|---------|
| OpenAI | 6.9.1 | GPT-4 Turbo, embeddings |
| Anthropic | 0.70.1 | Claude Sonnet 4.5 |
| Tesseract.js | 6.0.1 | OCR processing |

### UI Components
| Package | Version | Purpose |
|---------|---------|---------|
| Radix UI | various | Accessible primitives |
| Tailwind CSS | 3.4.16 | Utility-first styling |
| Lucide React | 0.462.0 | Icon library |
| FullCalendar | 6.1.19 | Calendar UI |
| Recharts | 3.4.1 | Chart library |

### State Management
| Package | Version | Purpose |
|---------|---------|---------|
| Zustand | 5.0.8 | Client state |
| React Query | 5.90.10 | Server state |

### Forms & Validation
| Package | Version | Purpose |
|---------|---------|---------|
| React Hook Form | 7.66.1 | Form management |
| Zod | 3.23.8 | Schema validation |

### Testing & Docs
| Package | Version | Purpose |
|---------|---------|---------|
| Playwright | 1.56.1 | E2E testing |
| Storybook | 10.0.8 | Component docs |

### Deployment
| Package | Version | Purpose |
|---------|---------|---------|
| PM2 | 6.0.13 | Process manager |
| Docker | - | Containerization |

---

## Environment Architecture

### Development Ports
| Service | Port |
|---------|------|
| Next.js | 3001 |
| Redis | 6379 |
| PostgreSQL | 5432 |
| n8n | 5678 |
| Storybook | 6006 |

### Production Infrastructure
| Component | Details |
|-----------|---------|
| Server | DigitalOcean Droplet (137.184.31.207) |
| Reverse Proxy | Caddy (HTTPS auto-certs) |
| Process Manager | PM2 (nextjs + worker) |
| Database | PostgreSQL (DigitalOcean Managed) |
| Redis | DigitalOcean Managed Redis |
| File Storage | DigitalOcean Spaces (S3-compatible) |

---

## Summary

**Astralis One** is a production-ready, enterprise-grade multi-agent AI platform with:

1. **Modern Architecture**: Next.js 15 App Router, React Server Components, TypeScript
2. **AI-Powered Features**: LLM-based routing, scheduling, document chat (RAG)
3. **Background Processing**: BullMQ worker queues for OCR, embeddings, automation
4. **Multi-Tenancy**: Organization-scoped data with RBAC
5. **Production Deployment**: Docker, PM2, Caddy reverse proxy, DigitalOcean
6. **Comprehensive Testing**: Playwright E2E tests, Storybook component docs
7. **Developer Experience**: Hot reload, TypeScript strict mode, Prisma types
8. **Brand Consistency**: Astralis design system with cyan/navy tech aesthetic

---

*Generated: 2025-11-27*
