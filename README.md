# Astralis One — Multi-Agent Engineering Platform

Enterprise-grade AI operations platform built with Next.js 15, TypeScript, and Prisma. Features multi-agent AI orchestration, document processing with RAG chat, intelligent scheduling, pipeline management, and comprehensive automation capabilities.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Configure environment
cp .env.local.template .env.local
# Edit .env.local with your credentials

# 3. Setup database
npx prisma generate
npx prisma migrate dev --name init

# 4. Start Redis (required for background workers)
redis-server

# 5. Start development server
npm run dev

# 6. Start background workers (in separate terminal)
npm run worker
```

Visit `http://localhost:3001`

## 📖 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup instructions
- **[CLAUDE.md](./CLAUDE.md)** - Project overview and development guidelines
- **[docs/BOOKING_SETUP.md](./docs/BOOKING_SETUP.md)** - Email and calendar configuration
- **[.env.local.template](./.env.local.template)** - All environment variables

## 🎯 Features

All core features are complete and production-ready:

- ✅ **Multi-Agent AI Orchestration** - OrchestrationAgent with Claude + OpenAI for intelligent decision-making
- ✅ **AI-Powered Intake Routing** - Automated triage and classification of incoming requests
- ✅ **Document Processing & RAG Chat** - OCR, embeddings, and conversational document analysis
- ✅ **AI Scheduling Agent** - Intelligent calendar management with conflict detection
- ✅ **Pipeline Management** - Kanban-style workflow with drag-and-drop
- ✅ **n8n Automation Integration** - External workflow orchestration and webhooks
- ✅ **Public Booking System** - Client-facing appointment scheduling with email confirmations
- ✅ **Calendar Integration** - Google Calendar sync and ICS file generation
- ✅ **Multi-tenant Authentication** - Role-based access control (ADMIN, OPERATOR, CLIENT, PM)
- ✅ **Analytics & Monitoring** - Google Analytics 4 + Google Ads tracking

## 🎨 Tech Stack

### Core Framework
- **Framework:** Next.js 15 (App Router) on port 3001
- **Language:** TypeScript 5 with strict mode
- **Styling:** Tailwind CSS 3 (Astralis brand design system)
- **Font:** Inter (Google Fonts)

### Data & Storage
- **Database:** PostgreSQL + Prisma ORM (89 models)
- **Queue System:** BullMQ + Redis for background job processing
- **File Storage:** DigitalOcean Spaces (S3-compatible)
- **State Management:** Zustand + React Query

### AI & Automation
- **AI Services:** OpenAI (GPT-4o) + Anthropic Claude (Sonnet 4.5)
- **OCR:** Tesseract.js for document text extraction
- **Embeddings:** OpenAI text-embedding-3-small for RAG
- **Workflows:** n8n integration via webhooks

### UI & Components
- **UI Library:** Radix UI primitives (40+ components)
- **Forms:** React Hook Form + Zod validation
- **Calendar:** FullCalendar with custom styling
- **Charts:** Recharts for analytics visualization
- **Testing:** Playwright E2E + Storybook for component testing

### Production Infrastructure
- **Process Manager:** PM2 for zero-downtime deployments
- **Email:** Nodemailer SMTP with HTML templates
- **Authentication:** NextAuth.js with Prisma adapter
- **Real-time:** WebSocket support via n8n webhooks

## 🏗️ Architecture Overview

```mermaid
graph TB
    Client[Next.js Client<br/>Port 3001]
    API[API Routes<br/>/api/*]
    DB[(PostgreSQL<br/>89 Models)]
    Redis[(Redis<br/>Job Queue)]
    Workers[BullMQ Workers]
    OA[OrchestrationAgent<br/>Claude + OpenAI]
    N8N[n8n Workflows]
    Spaces[DigitalOcean Spaces<br/>File Storage]
    GCal[Google Calendar<br/>API]

    Client --> API
    API --> DB
    API --> Redis
    API --> Spaces
    API --> GCal
    Redis --> Workers
    Workers --> DB
    Workers --> OA
    Workers --> Spaces
    API --> N8N
    N8N --> API

    style Client fill:#2B6CB0
    style DB fill:#0A1B2B
    style OA fill:#38A169
```

### Data Flow Patterns

**1. Document Processing Pipeline**
```
Upload → API → S3 Storage → Queue → Worker → OCR → Embeddings → DB → RAG Chat
```

**2. AI Orchestration Flow**
```
User Input → IntakeRequest → OrchestrationAgent → LLM Decision → Action Execution → Webhook/Email
```

**3. Booking System Flow**
```
Public Form → API Validation → Calendar Check → DB Insert → Email Queue → SMTP → ICS Attachment
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── (app)/             # Authenticated application pages
│   │   ├── dashboard/     # Main dashboard
│   │   ├── intake/        # AI intake management
│   │   ├── pipelines/     # Kanban workflow
│   │   ├── scheduling/    # Calendar & booking
│   │   ├── documents/     # Document library & RAG chat
│   │   ├── engagements/   # Client engagement wizard
│   │   └── settings/      # User & org settings
│   ├── (marketing)/       # Public marketing pages
│   │   ├── about/         # Company information
│   │   ├── services/      # Service offerings
│   │   └── solutions/     # Solution pages
│   ├── api/               # RESTful API routes (50+ endpoints)
│   │   ├── agents/        # AI agent endpoints
│   │   ├── bookings/      # Booking system API
│   │   ├── documents/     # Document processing
│   │   ├── pipelines/     # Pipeline CRUD
│   │   └── webhooks/      # n8n integration
│   ├── auth/              # Authentication pages
│   │   ├── signin/        # Login page
│   │   ├── signup/        # Registration
│   │   └── verify-email/  # Email verification
│   └── book/              # Public booking interface
├── components/            # React components (40+)
│   ├── ui/               # Radix UI primitives with Astralis styling
│   ├── pipelines/        # Pipeline/Kanban components
│   ├── scheduling/       # Calendar & scheduling UI
│   ├── documents/        # Document viewer & chat interface
│   ├── auth/             # Authentication forms
│   └── sections/         # Marketing page sections
├── lib/                   # Core libraries & utilities
│   ├── agent/            # Multi-agent AI system
│   │   ├── orchestration.ts  # OrchestrationAgent (main)
│   │   ├── scheduling.ts     # Scheduling Agent
│   │   └── document.ts       # Document processing
│   ├── auth/             # NextAuth.js configuration
│   ├── queries/          # React Query hooks
│   ├── prisma.ts         # Database client
│   └── validators/       # Zod schemas
├── workers/              # BullMQ background jobs
│   ├── processors/       # Job processing logic
│   │   ├── document-processor.ts
│   │   ├── email-processor.ts
│   │   ├── embedding-processor.ts
│   │   └── ocr-processor.ts
│   ├── queues/           # Queue definitions
│   └── index.ts          # Worker entry point
└── stores/               # Zustand state management

prisma/                    # Database schema & migrations
├── schema.prisma          # 89 models (Organization, User, Pipeline, etc.)
├── migrations/            # SQL migration history
└── seeds/                 # Database seed scripts

docs/                      # Additional documentation
├── ARCHITECTURE.md        # System architecture details
├── AGENTS.md             # Multi-agent system guide
├── WORKERS.md            # Background job documentation
└── API.md                # API endpoint reference

automation/n8n/           # n8n workflow definitions
marketplace/              # Digital product offerings
tests/e2e/               # Playwright E2E tests
```

## 🔧 Development Commands

### Development
```bash
npm run dev              # Start dev server on port 3001
npm run build            # Production build
npm run start            # Start production server on port 3001
npm run lint             # Run ESLint
npm run worker           # Start background workers (dev mode with watch)
npm run worker:prod      # Start production workers
```

### Testing
```bash
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Run tests with UI mode
npm run test:e2e:headed  # Run tests in headed browser
npm run test:e2e:debug   # Debug tests step by step
npm run test:e2e:report  # Show HTML test report
```

### Database
```bash
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Create and apply migrations
npx prisma migrate deploy # Apply migrations in production
npx prisma studio        # Open database GUI on localhost:5555
npx prisma db seed       # Run database seed script
npm run seed:pipelines   # Seed pipeline templates
npm run seed:templates   # Seed task templates
```

### Storybook (Component Development)
```bash
npm run storybook        # Start Storybook on port 6006
npm run build-storybook  # Build static Storybook
```

### Production Management (PM2)
```bash
npm run prod:start       # Start PM2 processes (app + worker)
npm run prod:stop        # Stop all PM2 processes
npm run prod:restart     # Restart all PM2 processes
npm run prod:reload      # Zero-downtime reload
npm run prod:logs        # View PM2 logs
npm run prod:status      # Show PM2 process status
```

## 🔐 Environment Variables

Required in `.env.local` (see `.env.local.template` for complete reference):

### Database & Auth
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/astralis_one"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3001"
```

### Redis (for BullMQ)
```bash
REDIS_URL="redis://localhost:6379"
```

### Email (SMTP)
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@astralisone.com"
```

### File Storage (DigitalOcean Spaces)
```bash
SPACES_ACCESS_KEY="your-access-key"
SPACES_SECRET_KEY="your-secret-key"
SPACES_ENDPOINT="nyc3.digitaloceanspaces.com"
SPACES_BUCKET="astralis-documents"
```

### AI Services
```bash
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
```

### Google Calendar (Optional)
```bash
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_REFRESH_TOKEN="..."
```

### n8n Integration
```bash
N8N_WEBHOOK_URL="https://automation.astralisone.com"
N8N_WEBHOOK_SECRET="your-webhook-secret"
```

### Analytics
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..."
NEXT_PUBLIC_GOOGLE_ADS_ID="AW-..."
```

## 🎨 Brand Design System

**Astralis Colors** (defined in `tailwind.config.ts`):
- **Navy:** `#0A1B2B` - Primary headings, dark backgrounds
- **Blue:** `#2B6CB0` - Primary actions, links, interactive elements
- **Status Colors:** Success (#38A169), Warning (#DD6B20), Error (#E53E3E), Info (#3182CE)
- **Neutrals:** Slate palette (50-950) for text and borders

**Design Tokens:**
- Border radius: 4px (sm), 6px (md), 8px (lg)
- Transitions: 150ms (fast), 200ms (normal), 250ms (slow)
- Shadows: `card`, `card-hover` variants
- Spacing: 4px increments (4, 8, 12, 16, 20, 24, 32, 48, 64, 96)

All UI components follow these design standards and include Storybook stories for visual testing.

## 🏭 Production Deployment

### Server Configuration
- **Host:** 137.184.31.207
- **Path:** `/home/deploy/astralis-nextjs`
- **SSH:** `ssh -i ~/.ssh/id_ed25519 root@137.184.31.207`
- **PM2 Logs:** `/var/log/pm2/astralis-*.log`

### Deployment Process
```bash
# 1. Connect to server
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207

# 2. Navigate to project
cd /home/deploy/astralis-nextjs

# 3. Pull latest code
git pull origin main

# 4. Install dependencies
npm install --legacy-peer-deps

# 5. Run database migrations
npx prisma migrate deploy

# 6. Build application
npm run build

# 7. Reload PM2 processes (zero-downtime)
npm run prod:reload
```

### Monitoring
```bash
pm2 list                     # Show all processes
pm2 logs astralis-nextjs     # View app logs
pm2 logs astralis-worker     # View worker logs
pm2 monit                    # Real-time monitoring
```

## 🧪 Testing Strategy

### E2E Tests (Playwright)
```
tests/e2e/
├── auth/          # Authentication flows (login, signup, reset)
├── booking/       # Public booking system
├── pipeline/      # Kanban pipeline operations
├── documents/     # Document upload & RAG chat
└── fixtures/      # Test data & helper functions
```

Run specific test file:
```bash
npx playwright test tests/e2e/auth/login.spec.ts
```

### Component Tests (Storybook)
Every UI component has a `.stories.tsx` file for:
- Visual regression testing
- Interactive documentation
- Accessibility testing (a11y addon)
- Responsive design validation

## 🏗️ Key Architectural Patterns

### 1. Multi-Agent AI System
The OrchestrationAgent coordinates multiple specialized AI agents:
- **Orchestration Agent**: Main decision-making entity (Claude Sonnet 4.5)
- **Scheduling Agent**: Calendar management and conflict resolution
- **Document Agent**: OCR, embeddings, and RAG chat
- **Intake Agent**: Request triage and routing

### 2. Background Job Processing
BullMQ queues handle async operations:
- Document processing (OCR, embeddings)
- Email sending with retry logic
- Calendar event creation
- n8n webhook dispatching

### 3. Multi-Step Wizards
Complex forms use step-based navigation:
- Engagement creation (7 steps)
- User onboarding
- Company setup
Uses React Hook Form + Zod validation with localStorage persistence.

### 4. Real-time Updates
- React Query for data fetching and caching
- Optimistic updates for responsive UI
- WebSocket support via n8n webhooks
- Server-sent events for job progress

### 5. Multi-tenant Architecture
- Organization-scoped data isolation
- Role-based access control (RBAC)
- Per-tenant customization
- Audit logging for compliance

## 🔒 Security Best Practices

- All API inputs validated with Zod schemas
- Parameterized queries via Prisma (SQL injection prevention)
- Rate limiting on authentication endpoints
- File upload sanitization and virus scanning
- Environment variables for secrets (never committed)
- CSRF protection via NextAuth.js
- Content Security Policy headers

## 🚀 Performance Optimizations

- React Query for intelligent data caching
- Pagination for large datasets
- Next.js Image optimization
- Dynamic imports for code splitting
- Redis caching for frequently accessed data
- Database indexes on frequently queried fields
- Background job processing for heavy operations

## 📚 Additional Resources

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup walkthrough
- **[CLAUDE.md](./CLAUDE.md)** - AI assistant instructions & patterns
- **[docs/BOOKING_SETUP.md](./docs/BOOKING_SETUP.md)** - Email & calendar config
- **[prisma/schema.prisma](./prisma/schema.prisma)** - Complete data model (89 models)
- **[ecosystem.config.js](./ecosystem.config.js)** - PM2 configuration
- **[playwright.config.ts](./playwright.config.ts)** - E2E test setup

## 🤝 Contributing

Follow Git workflow from `CLAUDE.md`:
- Branch from `main`
- Use feature branch naming: `feature/description` or `fix/description`
- Write clear commit messages
- Ensure all tests pass before submitting
- Run `npm run lint` to catch issues

## 📄 License

Private - Astralis One Platform

---

**Built with excellence by the Astralis One team**

For detailed setup instructions and troubleshooting, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)
