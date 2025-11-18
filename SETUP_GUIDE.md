# Astralis One - Setup & Execution Guide

This guide will help you complete the Astralis One platform setup and begin the branded refactor based on the master specification document.

## ✅ What's Already Done

1. **Scaffold Extraction**: The `astralis-one-scaffold.zip` has been extracted and integrated
2. **Project Structure**: Migrated to standard Next.js 14 structure (`src/app`, `src/lib`, etc.)
3. **Dependencies Installed**: All npm packages installed (React, Next.js 14, Tailwind, Prisma, Radix UI)
4. **Brand System Foundation**: Tailwind configured with Astralis Navy (#0A1B2B) and Blue (#2B6CB0) colors
5. **Development Server**: Verified working at `http://localhost:3001`
6. **Backup Created**: `astralis-nextjs-backup-20251118_024432.zip` contains your previous codebase

## 📁 Current Project Structure

```
astralis-nextjs/
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── page.tsx             # Homepage (dark theme, already styled)
│   │   ├── layout.tsx           # Root layout with Inter font
│   │   ├── globals.css          # Astralis brand theme + Tailwind
│   │   ├── api/                 # API routes (will be added)
│   │   ├── astralisops/         # AstralisOps product page (scaffold)
│   │   └── solutions/           # Solutions page (scaffold)
│   ├── components/              # React components (to be built)
│   ├── lib/                     # Utilities and helpers
│   │   └── utils.ts            # cn() utility for class merging
│   └── types/                   # TypeScript type definitions
├── prisma/
│   └── schema.prisma            # Database schema (Orgs, Users, Pipelines)
├── automation/
│   └── n8n/
│       └── workflows/
│           └── ai-intake-lead-routing.json  # n8n workflow template
├── marketplace/                  # Marketplace product packages
│   ├── ai-intake-kit/
│   ├── ai-scheduling-pack/
│   ├── document-processing-kit/
│   ├── ops-dashboard/
│   └── pipeline-templates/
├── docs/
│   └── ASTRALISOPS-PRD.md       # Product requirements
├── package.json                 # Dependencies configured
├── next.config.mjs              # Next.js configuration
├── tailwind.config.ts           # Astralis brand design tokens
└── .env.local                   # Environment variables template
```

## 🚀 Quick Start

### 1. Configure Database

Update `.env.local` with your PostgreSQL connection:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/astralis_one?schema=public"
```

### 2. Run Prisma Migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

This will create:
- `Organization` table
- `User` table (with ADMIN/OPERATOR/CLIENT roles)
- `Pipeline` table
- `Stage` table
- `PipelineItem` table

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3001` to see the homepage.

### 4. Import n8n Workflow

1. Open your n8n instance
2. Import `automation/n8n/workflows/ai-intake-lead-routing.json`
3. Configure the HTTP node to point to `http://localhost:3001/api/pipelines/[id]/items`
4. Update n8n webhook endpoints in your environment

## 📋 Execution Plan - Astralis Branded Refactor

Based on the master specification document (`astralis-branded-refactor.md`), here's the recommended execution plan:

### **Phase 1: Brand System & Components** (Week 1-2)

#### Tasks:
1. **Audit Current Components** (Day 1-2)
   - Review existing Radix UI components
   - Identify components that need brand updates
   - Create component inventory spreadsheet

2. **Build Core Component Library** (Day 3-7)
   - **Buttons** (Section 3.3 spec)
     - Primary: `bg-astralis-blue`, white text, 6px radius
     - Secondary: 1.5px border, blue text
     - Create `src/components/ui/button.tsx`

   - **Cards** (Section 3.3 spec)
     - White background, #E2E8F0 border
     - 24-32px padding, 8px radius
     - Subtle shadow: `rgba(0,0,0,0.06)`
     - Create `src/components/ui/card.tsx`

   - **Form Inputs** (Section 3.3 spec)
     - Slate-300 border, 6px radius
     - 2px blue focus ring
     - Create `src/components/ui/input.tsx`, `textarea.tsx`, `select.tsx`

   - **Navigation** (Section 3.3 spec)
     - Desktop: Logo left, nav right, active underline animation
     - Mobile: Hamburger → slide-out panel
     - Create `src/components/layout/navigation.tsx`

3. **Create Reusable Sections** (Day 8-10)
   - Hero section template (left text, right image/card)
   - Feature grid (3-4 cards)
   - CTA sections
   - Create in `src/components/sections/`

#### Deliverables:
- ✅ Brand-compliant component library
- ✅ Storybook documentation (optional but recommended)
- ✅ Component usage examples

---

### **Phase 2: Website Pages** (Week 3-4)

Follow spec Section 4 (Page Architecture)

#### 2.1 Homepage Refactor
**File:** `src/app/page.tsx`

**Structure:**
1. Hero Section
2. What We Do Overview
3. Core Capabilities (3-4 cards)
4. Why Astralis (4 pillars)
5. Featured Platform: AstralisOps
6. Logos/Trust Indicators
7. CTA Footer Section

**Action:** Refactor existing dark-theme homepage to match spec layout

---

#### 2.2 Solutions Page (NEW)
**File:** `src/app/(marketing)/solutions/page.tsx`

**Structure:**
- Hero
- AI Automation Systems
- Document Intelligence
- Platform Engineering
- SaaS Development
- CTA

**Action:** Create new page following spec Section 4.2

---

#### 2.3 AstralisOps Product Page
**File:** `src/app/(marketing)/astralisops/page.tsx`

**Structure:**
- Hero
- Feature List (2x3 or 3x2 grid)
- Workflow Diagram
- Outcomes
- Pricing Teaser
- Demo CTA

**Action:** Enhance existing scaffold page with full spec content

---

#### 2.4 Automation Services Page (NEW)
**File:** `src/app/(marketing)/services/automation/page.tsx`

**Structure:**
- Hero
- Package Overviews (Intake Automation, Document Console, etc.)
- Pricing Cards
- Examples
- Value Statements
- Contact CTA

**Action:** Create new page with pricing from spec Section 7

---

#### 2.5 Marketplace Enhancement
**File:** `src/app/(marketing)/marketplace/page.tsx`

**Structure:**
- Hero
- 3-column product grid
- Category filters
- Product cards (from spec Section 6)

**Action:** Build out 5 marketplace products:
1. Enterprise Automation Toolkit
2. React Enterprise Component Pack
3. Nx Monorepo Starter
4. AI Document Console
5. Agent Blueprint Pack

---

#### 2.6 About Page
**File:** `src/app/(marketing)/about/page.tsx`

**Structure:**
- Hero
- Mission
- Experience
- Approach
- Leadership (optional)
- CTA

---

#### 2.7 Contact Page
**File:** `src/app/(marketing)/contact/page.tsx`

**Structure:**
- Hero
- 5-field form
- Sidebar with contact info
- Map placeholder (optional)

---

### **Phase 3: AstralisOps SaaS Foundation** (Week 5-6)

Follow spec Section 5 (AstralisOps Product Spec)

#### 3.1 Database Schema Enhancement

Extend `prisma/schema.prisma` with:

```prisma
model Document {
  id        String   @id @default(cuid())
  filename  String
  content   Json
  status    String
  orgId     String
  createdAt DateTime @default(now())

  organization Organization @relation(fields: [orgId], references: [id])
}

model IntakeRequest {
  id        String   @id @default(cuid())
  source    String   // form, email, chat
  data      Json
  routedTo  String?
  orgId     String
  createdAt DateTime @default(now())

  organization Organization @relation(fields: [orgId], references: [id])
}

model Automation {
  id           String   @id @default(cuid())
  name         String
  workflowUrl  String   // n8n webhook URL
  active       Boolean  @default(true)
  orgId        String

  organization Organization @relation(fields: [orgId], references: [id])
}
```

Run: `npx prisma migrate dev --name add_astralisops_models`

---

#### 3.2 API Route Handlers

Create API endpoints:

1. **AI Intake Routing**
   - `src/app/api/intake/route.ts`
   - POST endpoint to capture requests
   - Route to appropriate pipeline based on AI analysis

2. **Document Processing**
   - `src/app/api/documents/route.ts`
   - Upload, OCR, extract structured data

3. **Pipeline Management**
   - `src/app/api/pipelines/route.ts`
   - CRUD operations for pipelines
   - `src/app/api/pipelines/[id]/items/route.ts`
   - Manage pipeline items (for n8n integration)

4. **Workflow Automation**
   - `src/app/api/automations/route.ts`
   - Trigger n8n workflows
   - Manage automation rules

---

#### 3.3 Dashboard UI (Pages Router)

Create interactive dashboards in `src/pages/ops/`:

1. **Main Dashboard**
   - `src/pages/ops/dashboard/index.tsx`
   - Overview metrics, active pipelines, recent activity

2. **Workflows**
   - `src/pages/ops/workflows/index.tsx`
   - List and manage n8n workflows

3. **Documents**
   - `src/pages/ops/documents/index.tsx`
   - Document library, processing status

4. **Team**
   - `src/pages/ops/team/index.tsx`
   - User management, role assignment

---

### **Phase 4: n8n Integration** (Week 7)

#### 4.1 Setup n8n

Follow instructions from scaffold:

1. Import `automation/n8n/workflows/ai-intake-lead-routing.json` into n8n
2. Configure HTTP node to point to `/api/pipelines/[id]/items`
3. Test workflow with sample data

#### 4.2 Webhook Configuration

Create webhook handlers:

```typescript
// src/app/api/webhooks/n8n/route.ts
export async function POST(request: Request) {
  const payload = await request.json();

  // Process n8n webhook data
  // Update pipeline items
  // Trigger notifications

  return Response.json({ success: true });
}
```

---

### **Phase 5: Content System** (Week 8)

Follow spec Section 8 (Content System)

#### 5.1 Blog Categories

Create blog structure:

```typescript
// src/data/blog-categories.ts
export const blogCategories = [
  { id: "automation", name: "Automation", slug: "automation" },
  { id: "ai-architecture", name: "AI Architecture", slug: "ai-architecture" },
  { id: "saas-engineering", name: "SaaS Engineering", slug: "saas-engineering" },
  { id: "business-efficiency", name: "Business Efficiency", slug: "business-efficiency" },
  { id: "case-studies", name: "Case Studies", slug: "case-studies" },
];
```

#### 5.2 Blog Posts

Write 2-3 seed posts per category (10-15 total):
- Clear problem → solution structure
- Business-first tone
- Technical credibility
- Measurable outcomes

---

### **Phase 6: Testing & Deployment** (Week 9)

#### 6.1 Quality Assurance

- Test all page routes
- Verify brand consistency
- Validate responsive design
- Accessibility audit (WCAG compliance)
- Cross-browser testing
- Performance optimization (Core Web Vitals)

#### 6.2 Deployment

1. **Environment Setup**
   ```bash
   # Production environment variables
   DATABASE_URL="<production-db-url>"
   NEXT_PUBLIC_API_BASE_URL="https://api.astralisone.com"
   ```

2. **Vercel Deployment**
   ```bash
   npx vercel --prod
   ```

3. **Database Migration**
   ```bash
   npx prisma migrate deploy
   ```

---

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start dev server on port 3001

# Build
npm run build            # Production build
npm run start            # Start production server

# Database
npx prisma studio        # Open Prisma Studio (DB GUI)
npx prisma migrate dev   # Create new migration
npx prisma generate      # Regenerate Prisma Client

# Code Quality
npm run lint             # Run ESLint
```

---

## 🎨 Brand Design Tokens

### Colors (from spec Section 2.3)

```css
/* Primary */
--astralis-navy: #0A1B2B
--astralis-blue: #2B6CB0

/* Neutrals */
--slate-100: #F7FAFC
--slate-300: #E2E8F0
--slate-500: #718096
--slate-700: #2D3748
--slate-900: #1A202C

/* Statuses */
--success: #38A169
--warning: #DD6B20
--error: #E53E3E
--info: #3182CE
```

### Typography

- **Font:** Inter (400/500/600/700)
- **Headlines:** 48px (Hero), 32px (H2), 24px (H3)
- **Body:** 20px (subheadlines), 16px (body text)

### Spacing Scale (spec Section 3.2)

4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px, 64px, 96px

### Animation Timing (spec Section 2.2)

150-250ms for all transitions (fades/slides only)

---

## 📦 Marketplace Products

Create product pages for (spec Section 6):

1. **Enterprise Automation Toolkit** - $149
2. **React Enterprise Component Pack** - $99
3. **Nx Monorepo Starter (Enterprise Edition)** - $299
4. **AI Document Console (Solo)** - $199
5. **Agent Blueprint Pack** - $79

Each product needs:
- Title, description, contents
- File structure documentation
- Installation instructions
- Pricing tier
- Download/delivery system

---

## 🤖 Multi-Agent Orchestration

For parallel development, use these agent roles (spec Section 9):

1. **Brand UI Agent** → Component library
2. **Frontend Engineer** → Pages and layouts
3. **Backend Engineer** → API routes and database
4. **Content Agent** → Blog posts and copy
5. **QA Agent** → Testing and validation
6. **Deployment Agent** → Production setup

Launch agents in parallel using the Task tool with appropriate subagent types.

---

## 📚 Key Resources

- **Master Spec:** `astralis-branded-refactor.md`
- **Product Requirements:** `docs/ASTRALISOPS-PRD.md`
- **Database Schema:** `prisma/schema.prisma`
- **n8n Workflow:** `automation/n8n/workflows/ai-intake-lead-routing.json`
- **Marketplace Products:** `marketplace/*/README.md`

---

## 🚨 Important Notes

1. **Database Required:** You must configure a PostgreSQL database before running migrations
2. **No Database Writes (Per CLAUDE.md):** Implement read-only operations unless triple-verified
3. **Git Flow:** Always branch from `main`, use `feature/SIT-####-description` naming
4. **Commit Messages:** Start with Jira ticket number (e.g., "SIT-1234 add homepage")
5. **No Silent Failures:** Always show errors, don't fail gracefully unless explicitly requested

---

## 📞 Next Steps

1. **Configure your database** in `.env.local`
2. **Run Prisma migrations:** `npx prisma migrate dev --name init`
3. **Start the dev server:** `npm run dev`
4. **Begin Phase 1:** Create brand-compliant component library
5. **Follow the execution plan** week by week

For questions or issues, refer to the master specification document or consult the project's CLAUDE.md file.

---

**Happy building! 🚀**
