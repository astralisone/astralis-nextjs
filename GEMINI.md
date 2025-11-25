# Astralis One - Project Overview for Gemini

This document provides a comprehensive overview of the Astralis One project, designed to serve as instructional context for future interactions with the Gemini AI agent.

## 🚀 Project Overview

Astralis One is an enterprise-grade AI operations platform built with **Next.js 15**, **TypeScript**, and **Prisma**. It leverages a modern web stack to deliver a multi-agent engineering platform.

**Key Technologies:**
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3 (with Astralis brand design system)
- **Database:** PostgreSQL + Prisma ORM
- **State Management:** Zustand
- **UI Components:** Radix UI primitives
- **Automation:** n8n workflows (integrated for AI intake routing, etc.)
- **Queue Management:** BullMQ (for background workers)
- **Containerization:** Docker (for app, PostgreSQL, Redis, n8n)
- **Testing:** Playwright (E2E testing)
- **API Integration:** OpenAI, Anthropic, AWS S3

**Core Features & Purpose:**
The platform aims to provide solutions for:
- Multi-tenant organization structure
- Pipeline management system (for intake and workflows)
- AI intake routing and document processing
- Workflow automation with n8n integration
- Marketplace for digital products
- Comprehensive audit, consultation, and booking functionalities
- User and role-based access control (RBAC)
- Newsletter and content management

The project is undergoing a significant "branded refactor" to implement the Astralis brand design system and expand its feature set as detailed in the `astralis-branded-refactor.md` and `SETUP_GUIDE.md`.

## ⚙️ Building and Running the Project

### Prerequisites

- Node.js (v18+)
- npm (or yarn/pnpm)
- Docker & Docker Compose (for local development with services)
- PostgreSQL (if not using Docker)

### Quick Start (Local Development)

1.  **Install dependencies:**
    ```bash
    npm install --legacy-peer-deps
    ```

2.  **Configure environment variables:**
    Copy the template and edit `.env.local` with your database URL and other necessary variables.
    ```bash
    cp .env.local.template .env.local
    # Edit .env.local with your DATABASE_URL, NEXT_PUBLIC_API_BASE_URL, etc.
    ```

3.  **Setup Database (via Prisma):**
    Ensure PostgreSQL is running (e.g., via Docker Compose) before running migrations.
    ```bash
    npx prisma generate
    npx prisma migrate dev --name init
    ```

4.  **Start Development Server:**
    The application will run on `http://localhost:3001`.
    ```bash
    npm run dev
    ```

### Other Useful Commands

-   **Production Build & Start:**
    ```bash
    npm run build
    npm run start
    ```
-   **Linting:**
    ```bash
    npm run lint
    ```
-   **Prisma Studio (Database GUI):**
    ```bash
    npx prisma studio
    ```
-   **Run Workers:**
    ```bash
    npm run worker # Development
    npm run worker:prod # Production
    ```
-   **End-to-End Tests (Playwright):**
    ```bash
    npm run test:e2e
    npm run test:e2e:ui # With UI
    ```
-   **Docker Compose (Production):**
    To run the application and its services (PostgreSQL, Redis, n8n) using Docker Compose:
    ```bash
    docker compose up --build
    ```

## 📐 Development Conventions & Guidelines

### Project Structure Highlights

-   `src/app/`: Next.js 15 App Router for pages and API routes.
-   `src/components/`: Reusable React components.
-   `src/lib/`: Utility functions and helpers.
-   `src/types/`: TypeScript type definitions.
-   `prisma/`: Prisma schema and database migrations.
-   `automation/n8n/`: n8n workflow definitions.
-   `marketplace/`: Definitions for digital products.
-   `docs/`: Extensive project documentation.
-   `tests/e2e/`: Playwright end-to-end tests.

### Git Workflow

-   **Branching:** Follow Git Flow; always branch from `main`.
-   **Branch Naming:** Use the format `feature/SIT-####-description` (e.g., `feature/SIT-1234-add-homepage`).
-   **Commit Messages:** Start with the Jira ticket number (e.g., `SIT-1234 Add homepage layout`).

### Coding Standards

-   **TypeScript:** Strictly typed.
-   **ESLint:** Enforced for code quality (`npm run lint`).
-   **Tailwind CSS:** Used for styling, adhering to the Astralis brand design system.

### Brand Design Tokens

**Colors:**
-   `--astralis-navy: #0A1B2B` (Primary)
-   `--astralis-blue: #2B6CB0` (Primary)
-   Neutrals: `--slate-100` to `--slate-900`
-   Statuses: `--success`, `--warning`, `--error`, `--info`

**Typography:**
-   **Font:** Inter (400/500/600/700)
-   **Headlines:** 48px (Hero), 32px (H2), 24px (H3)
-   **Body:** 20px (subheadlines), 16px (body text)

**Spacing Scale:** 4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px, 64px, 96px

**Animation Timing:** 150-250ms for all transitions (fades/slides only).

### Important Notes

-   **Database Required:** A PostgreSQL database must be configured and accessible before running Prisma migrations.
-   **No Database Writes (Unless Verified):** Implement read-only operations unless explicitly triple-verified to prevent unintended data modifications.
-   **No Silent Failures:** Always ensure errors are clearly surfaced; avoid graceful failures unless specifically requested.

### Key Resources

-   **Master Specification:** `astralis-branded-refactor.md`
-   **Complete Setup Guide:** `SETUP_GUIDE.md`
-   **AI Assistant Instructions:** `CLAUDE.md`
-   **Product Requirements:** `docs/ASTRALISOPS-PRD.md`
-   **Database Schema Details:** `prisma/schema.prisma`
-   **n8n Workflows:** `automation/n8n/workflows/`

This `GEMINI.md` file will serve as a foundational document for understanding the Astralis One project and guiding future development tasks.
