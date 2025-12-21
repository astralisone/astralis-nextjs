# ⭐ ASTRALIS ONE — MASTER PROJECT SPECIFICATION

**Version:** 2.0 (Post-Production Release)
**Status:** Live / Production Ready
**Purpose:** Maintain and extend the enterprise AI operations platform
**Audience:** Architecture agents, UI agents, full-stack agents, automation agents, PM agents, content agents, and QA agents.
**Style:** Precise, unambiguous, enterprise-grade instructions.

---

# 🧩 SECTION 1 — PROJECT OVERVIEW

## 1.1 Product Vision

Astralis One is a production-grade AI operations and engineering platform consisting of:

*   **AstralisOne.com** — Corporate website (integrated Next.js app)
*   **AstralisOps** — Flagship SaaS (AI Operations Console)
*   **Astralis Marketplace** — Digital products + toolkits
*   **Astralis Automation Services** — Consulting + deployments
*   **Astralis Brand System** — Corporate identity, UI standards, component library

**Goal:**
> Build, maintain, and scale a modular, enterprise-ready system for operations automation and SaaS product delivery.

The platform serves SMBs → mid-market → enterprise.

---

# 🧩 SECTION 2 — BRAND FOUNDATION

## 2.1 Brand Voice
*   Corporate, clear, confident
*   Short sentences, no jargon unless required
*   Measurable impact > hype
*   **Key Terms:** Streamline, optimize, automate, scale, standardize

## 2.2 Visual Style
*   Modern enterprise SaaS
*   Clean white space
*   Soft shadows
*   Navy + Blue color palette
*   Minimal animation (150–250ms)

## 2.3 Color Palette
*   **Primary:**
    *   Astralis Navy: `#0A1B2B`
    *   Astralis Blue: `#2B6CB0`
*   **Neutrals:**
    *   Slate-100: `#F7FAFC`
    *   Slate-300: `#E2E8F0`
    *   Slate-500: `#718096`
    *   Slate-700: `#2D3748`
    *   Slate-900: `#1A202C`
*   **Statuses:**
    *   Success: `#38A169`
    *   Warning: `#DD6B20`
    *   Error: `#E53E3E`
    *   Info: `#3182CE`

## 2.4 Typography
*   **Primary:** Inter (400 / 500 / 600 / 700)
*   **Secondary:** IBM Plex Sans (optional technical accents)

---

# 🧩 SECTION 3 — UI SYSTEM (FOR UI AGENTS)

## 3.1 Layout Grid
*   12-column
*   Max width: 1280px
*   Horizontal padding: 80–120px
*   Section spacing: 96–120px

## 3.2 Spacing Scale
4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64 / 96 px increments

## 3.3 Component Library Requirements (Radix UI + Tailwind)

### **Buttons**
*   **Primary:** Astralis Blue background, White text, 6px radius, hover darker blue.
*   **Secondary:** Astralis Blue border (1.5px), Astralis Blue text, light blue fill hover.
*   **Motion:** 150ms ease-out.

### **Cards**
*   Background: White
*   Border: 1px `#E2E8F0`
*   Shadow: `rgba(0,0,0,0.06)`
*   Padding: 24–32px
*   Radius: 8px
*   **Structure:** Title (H4), subtitle (Body S), icon top-left.

### **Text Inputs**
*   Border: Slate-300
*   Radius: 6px
*   Shadow: none
*   Focus ring: Astralis Blue 2px

### **Navigation**
*   **Desktop:** Logo left, Nav items right, Active underline animation (bottom slide-in).
*   **Mobile:** Hamburger → slide-out panel, Link spacing 24px.

### **Hero Template**
*   Left column text
*   Right column interactive visual (e.g., `InteractivePipelineHero`)
*   Headline: 48px
*   Subheadline: 20px
*   Two buttons: primary + outline

---

# 🧩 SECTION 4 — WEBSITE PAGES (STRUCTURED FOR CONTENT + UI AGENTS)

## 4.1 Homepage
*   **Purpose:** Introduce Astralis, position value, route users to Solutions & AstralisOps.
*   **Structure:**
    1.  Hero Section (Interactive)
    2.  What We Do Overview
    3.  Core Capabilities
    4.  Why Astralis (Pillars)
    5.  Featured Platform: AstralisOps
    6.  Logos/Trust
    7.  CTA Footer Section

## 4.2 Solutions Page
*   **Purpose:** Show categories of expertise and what Astralis solves.
*   **Structure:** Hero (Live Visuals), AI Automation Systems, Document Intelligence, Platform Engineering, SaaS Development, CTA.

## 4.3 Product Page — AstralisOps
*   **Purpose:** Sell the SaaS, list features, book demos.
*   **Structure:** Hero (Live Workflow Visual), Feature list, Workflow diagram, Outcomes, Pricing teaser, Demo CTA.

## 4.4 Automation Services
*   **Purpose:** Convert SMBs & mid-market clients.
*   **Structure:** Hero, Package overviews, Examples, Value statements, Contact CTA.

## 4.5 Marketplace
*   **Purpose:** Sell digital products.
*   **Structure:** Hero, Product grid (3-column), Categories, Product cards, CTA.

## 4.6 About Page
*   **Purpose:** Build credibility.
*   **Structure:** Hero, Mission, Experience, Approach, Leadership, CTA.

## 4.7 Contact Page
*   **Structure:** Hero, Form (5 fields), Direct email & scheduling, Sidebar contact info.

---

# 🧩 SECTION 5 — ASTRALISOPS — FULL PRODUCT SPEC

## 5.1 Summary
AstralisOps is a unified operations console for SMBs and mid-market organizations, now fully production-ready with live integrations.

## 5.2 Core Features (Implemented)
1.  **AI Intake Routing:** Intelligent classification and routing of incoming requests.
2.  **AI Scheduling:** Google Calendar integration, conflict detection, real-time availability.
3.  **Document Processing:** OCR (Tesseract), Vision AI, RAG chat.
4.  **Workflow Automation:** n8n webhook integration, task orchestration.
5.  **Dashboard:** Live activity timelines, interactive widgets.
6.  **Pipelines:** Kanban-style task management.
7.  **System Integrations:** Gmail, Google Calendar, QuickBooks (Live REST API).
8.  **User Accounts:** NextAuth (Google/Credentials), RBAC.
9.  **Team Permissions:** Organization-based isolation.

---

## 5.3 Architecture

### Frontend
*   **Next.js 15 (App Router)**
*   **TypeScript**
*   **Tailwind CSS**
*   **State:** Zustand + React Context
*   **Data Fetching:** Server Actions + React Query

### Backend
*   **API:** Next.js Route Handlers
*   **Database:** PostgreSQL (Prisma ORM)
*   **Queue:** BullMQ + Upstash Redis
*   **Workers:** Node.js processes on Fly.io
*   **Storage:** Vercel Blob

### Integrations (Live)
*   **Calendar:** Google Calendar API (OAuth2)
*   **Email:** Gmail API (OAuth2) + SMTP/Resend
*   **Accounting:** QuickBooks Online API (OAuth2)
*   **SMS:** Twilio SDK

### Deployment
*   **Frontend/API:** Vercel
*   **Workers:** Fly.io
*   **Database:** Managed PostgreSQL (e.g., Neon/Vercel Postgres)

---

# 🧩 SECTION 6 — MARKETPLACE PRODUCT SPECS

Marketplace items include:
1.  **Enterprise Automation Toolkit**
2.  **React Enterprise Component Pack**
3.  **Nx Monorepo Starter (Enterprise Edition)**
4.  **AI Document Console (Solo)**
5.  **Agent Blueprint Pack**

---

# 🧩 SECTION 7 — PRICING STRUCTURE

## SMB Pricing
*   **Intake Automation:** $750 + $99/mo
*   **Document Console:** $1,200 + $149/mo
*   **Operations Suite:** $3,500
*   **Custom Deployment:** $7,500–$25,000
*   **Optimization Retainer:** $450/mo

## Marketplace Pricing
*   $29–$299 per asset

---

# 🧩 SECTION 8 — MULTI-AGENT ROLES (AUTOMATION READY)

1.  **Product Owner Agent:** Owns the spec, resolves ambiguity.
2.  **Architecture Agent:** Generates schema, API routes, folder structures.
3.  **Frontend UI Agent:** Builds components, pages, and layouts.
4.  **Backend Systems Agent:** Builds APIs, models, workflows.
5.  **Automation Agent:** Designs n8n workflows and service automations.
6.  **Content Agent:** Writes UX copy, documentation, onboarding flows.
7.  **Brand UI Agent:** Ensures consistency with color, type, spacing.
8.  **QA Agent:** Tests flows, validates logic.
9.  **Integration Agent:** Handles CRMs, email, scheduling APIs (Live).
10. **Deployment Agent:** Vercel + Fly.io setups, CI/CD.
11. **Marketplace Agent:** Builds product packages for sale.
12. **Growth Agent:** Builds landing pages, funnels, email sequences.

---

# 🧩 SECTION 9 — PROJECT FOUNDATIONAL DIRECTIVES

1.  **Brand Compliance:** The brand style guide MUST be followed precisely.
2.  **Enterprise Patterns:** All outputs MUST use enterprise UI patterns.
3.  **Strict Typing:** Use TypeScript everywhere.
4.  **Clean Structure:** Maintain `/app`, `/components`, `/lib`, `/api`, `/styles`, `/utils`.
5.  **Accessibility:** Required for all UI components.
6.  **Responsiveness:** All UI must be fully responsive.
7.  **Messaging Alignment:** All content must align with messaging pillars.
8.  **Animation Limits:** No animations beyond 150–250ms fades/slides.
9.  **AI Safety:** AI usage must have guardrails + logging.
10. **Testability:** All automations must be testable and documented.
11. **Production-First:** No mocks in core logic; use live integrations or secure fallbacks.