# Astralis One — Multi-Agent Engineering Platform

Enterprise-grade AI operations platform built with Next.js 14, TypeScript, and Prisma.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Configure environment
cp .env.local.template .env.local
# Edit .env.local with your DATABASE_URL

# 3. Setup database
npx prisma generate
npx prisma migrate dev --name init

# 4. Start development server
npm run dev
```

Visit `http://localhost:3001`

## 📖 Complete Setup Guide

**See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for:**
- Detailed setup instructions
- Complete execution plan for branded refactor
- Component library specifications
- Page architecture guidelines
- Database schema documentation
- n8n workflow integration
- Multi-agent orchestration strategy

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js 14 App Router
│   ├── page.tsx        # Homepage
│   ├── layout.tsx      # Root layout
│   ├── globals.css     # Astralis brand theme
│   ├── astralisops/    # Product pages
│   └── api/            # API routes
├── components/         # React components
├── lib/               # Utilities
└── types/             # TypeScript types

prisma/                # Database schema
automation/n8n/        # n8n workflows
marketplace/           # Digital products
docs/                  # Documentation
```

## 🎨 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3 (Astralis brand design system)
- **Database:** PostgreSQL + Prisma ORM
- **UI Components:** Radix UI primitives
- **Automation:** n8n workflows
- **Font:** Inter (Google Fonts)

## 🎯 Features

- ✅ Astralis brand design system (Navy #0A1B2B + Blue #2B6CB0)
- ✅ Dark theme optimized UI
- ✅ PostgreSQL database with Prisma ORM
- ✅ Multi-tenant organization structure
- ✅ Pipeline management system
- ✅ n8n workflow integration
- ✅ Marketplace digital products
- 🚧 AI intake routing
- 🚧 Document processing
- 🚧 Team permissions (RBAC)

## 🔧 Development

```bash
npm run dev          # Start dev server (port 3001)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open database GUI
```

## 📋 Master Specification

This project implements the **Astralis One Master Specification** from `astralis-branded-refactor.md`:

- **Section 1-2:** Project overview and brand foundation
- **Section 3:** UI system and component library
- **Section 4:** Website page architecture
- **Section 5:** AstralisOps SaaS product spec
- **Section 6-10:** Marketplace, content, and multi-agent roles

## 🗂️ Key Files

- `SETUP_GUIDE.md` - Complete setup and execution plan
- `astralis-branded-refactor.md` - Master specification document
- `CLAUDE.md` - AI assistant project instructions
- `docs/ASTRALISOPS-PRD.md` - Product requirements
- `prisma/schema.prisma` - Database schema
- `automation/n8n/workflows/*.json` - n8n workflow definitions

## 🔐 Environment Variables

Required in `.env.local`:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/astralis_one"
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"
```

## 📦 Backup

A backup of the previous codebase is available:
- `astralis-nextjs-backup-20251118_024432.zip`

## 🤝 Contributing

Follow Git Flow guidelines from `CLAUDE.md`:
- Branch from `main`
- Use format: `feature/SIT-####-description`
- Commit messages: `SIT-#### description`

## 📄 License

Private - Astralis One Platform

---

**For detailed instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

