# Astralis One Multi-Agent Engineering System

## Overview

The Astralis One project uses a sophisticated multi-agent system for coordinated development across the entire ecosystem. This system enables complex, multi-faceted tasks to be decomposed and executed by specialized agents working in concert.

## System Architecture

### Orchestrator

**Astralis Orchestrator** - The central coordination agent responsible for:
- Breaking down user requests into tasks
- Assigning tasks to specialized agents
- Enforcing brand and technical rules
- Merging agent outputs into coherent deliverables

### Specialized Agents

The system includes 11 specialized agents, each with distinct responsibilities:

#### 1. Product Owner Agent
**Purpose**: Translates business goals into product requirements
**Key Outputs**:
- Epics and features
- User stories with acceptance criteria
- Roadmaps and release plans

**Invocation**: Use when defining product features, user stories, or strategic planning

#### 2. Systems Architect Agent
**Purpose**: Designs high-level architecture and infrastructure
**Key Outputs**:
- Architecture diagrams
- Prisma data models
- Integration flows
- Infrastructure plans (DigitalOcean-focused)

**Invocation**: Use when architecting new features, designing data models, or planning infrastructure

#### 3. Frontend UI Agent
**Purpose**: Builds UI components and page layouts
**Key Outputs**:
- React/TSX components with TypeScript
- Tailwind CSS styling
- Responsive layouts
- Accessibility implementations

**Invocation**: Use when creating pages, components, or UI implementations

#### 4. Backend API Agent
**Purpose**: Implements backend endpoints and services
**Key Outputs**:
- Next.js API routes
- Prisma queries and mutations
- Zod validation schemas
- API documentation

**Invocation**: Use when creating APIs, database operations, or backend logic

#### 5. Automation Agent
**Purpose**: Designs n8n workflows and automations
**Key Outputs**:
- n8n workflow designs
- Webhook integrations
- Event-driven automation flows
- Error handling strategies

**Invocation**: Use when creating automation workflows or integrations

#### 6. Documentation Agent
**Purpose**: Creates comprehensive technical documentation
**Key Outputs**:
- READMEs
- Architecture documentation
- Setup guides
- Troubleshooting guides

**Invocation**: Use when documenting features, systems, or processes

#### 7. Content Writer Agent
**Purpose**: Writes marketing and product copy
**Key Outputs**:
- Website content (page-by-page, section-by-section)
- Email templates
- UX microcopy
- CTA text

**Invocation**: Use when writing marketing pages, product descriptions, or user-facing content

#### 8. Brand Consistency Agent
**Purpose**: Enforces Astralis brand standards
**Key Outputs**:
- Brand compliance reviews
- Style recommendations
- Corrected versions of non-compliant content

**Invocation**: Use when reviewing UI, copy, or documentation for brand alignment

#### 9. QA Agent
**Purpose**: Defines test strategies and test cases
**Key Outputs**:
- Test plans
- Test cases (UI, API, workflows)
- Acceptance criteria validation
- Edge case scenarios

**Invocation**: Use when creating test plans or validating feature completeness

#### 10. Deployment Agent
**Purpose**: Plans CI/CD and deployment strategies
**Key Outputs**:
- Deployment instructions
- CI/CD pipeline configurations
- Environment variable specifications
- Rollback strategies

**Invocation**: Use when planning deployments or CI/CD pipelines

#### 11. Marketplace Packaging Agent
**Purpose**: Structures marketplace products
**Key Outputs**:
- Product metadata schemas
- Folder structures
- Installation guides
- Product READMEs

**Invocation**: Use when creating marketplace products, templates, or kits

## Agent Files Location

All agent prompt files are located in:
```
.claude/agents/
├── astralis-orchestrator.md
├── product-owner.md
├── systems-architect.md
├── frontend-ui.md
├── backend-api.md
├── automation.md
├── documentation.md
├── content-writer.md
├── brand-consistency.md
├── qa.md
├── deployment.md
└── marketplace-packaging.md
```

## Usage Examples

### Example 1: New Feature Development

**Request**: "Add AI document processing to AstralisOps"

**Agent Orchestration**:
1. **Product Owner Agent**: Defines user stories and acceptance criteria
2. **Systems Architect Agent**: Designs Prisma models for Documents, OCR results
3. **Backend API Agent**: Creates `/api/documents` endpoints with Prisma queries
4. **Frontend UI Agent**: Builds document upload component with progress tracking
5. **Automation Agent**: Designs n8n workflow for OCR processing
6. **QA Agent**: Creates test plan for document upload/processing
7. **Documentation Agent**: Writes setup guide for document processing feature
8. **Brand Consistency Agent**: Reviews UI/copy for brand alignment

### Example 2: New Marketing Page

**Request**: "Create the Automation Services page"

**Agent Orchestration**:
1. **Product Owner Agent**: Defines page objectives and key messages
2. **Content Writer Agent**: Drafts section-by-section copy
3. **Frontend UI Agent**: Creates page layout with components
4. **Brand Consistency Agent**: Reviews tone, terminology, visual style
5. **Documentation Agent**: Adds page to site map documentation

### Example 3: Marketplace Product

**Request**: "Create an AI Intake Workflow Kit for the marketplace"

**Agent Orchestration**:
1. **Product Owner Agent**: Defines product value proposition
2. **Automation Agent**: Designs n8n workflow for lead routing
3. **Backend API Agent**: Documents required webhooks/endpoints
4. **Marketplace Packaging Agent**: Creates product metadata, README, folder structure
5. **Documentation Agent**: Writes installation and configuration guide
6. **Brand Consistency Agent**: Reviews naming and presentation
7. **QA Agent**: Creates test checklist for buyers

## Workflow Templates

### Standard Feature Development Workflow

```
Request → Product Owner → Systems Architect → [Frontend UI + Backend API + Automation] → QA → Documentation → Brand Consistency
```

### Marketing Page Workflow

```
Request → Product Owner → Content Writer → Frontend UI → Brand Consistency → Documentation
```

### Marketplace Product Workflow

```
Request → Product Owner → [Automation + Backend API] → Marketplace Packaging → Documentation → Brand Consistency → QA
```

## Integration with Development Process

### When to Use Multi-Agent Orchestration

Use the multi-agent system for:
- ✅ Complex features spanning multiple domains (frontend, backend, automation)
- ✅ New pages or major UI updates
- ✅ Architecture decisions or system designs
- ✅ Marketplace product creation
- ✅ Content creation for marketing pages
- ✅ Complete feature development from concept to deployment

### When NOT to Use Multi-Agent Orchestration

Skip orchestration for:
- ❌ Simple bug fixes
- ❌ Minor UI tweaks
- ❌ Single-file edits
- ❌ Quick documentation updates
- ❌ Trivial configuration changes

## Best Practices

1. **Clear Task Definition**: Start with a well-defined task or feature request
2. **Agent Sequencing**: Consider dependencies when ordering agent invocations
3. **Cross-Agent Consistency**: Ensure agents reference each other's outputs for naming and structure
4. **Iterative Refinement**: Use Brand Consistency Agent to review outputs before finalization
5. **Complete Deliverables**: Always include Documentation and QA agents for production features

## Technical Context

All agents operate within the Astralis technical ecosystem:

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Infrastructure**: DigitalOcean (App Platform, Managed PostgreSQL, Droplets, Spaces)
- **Automation**: n8n workflows
- **Brand**: Astralis Navy (#0A1B2B), Astralis Blue (#2B6CB0), Inter font

## Future Enhancements

Potential system improvements:
- Agent interaction logging and tracking
- Automated agent validation (outputs checked against requirements)
- Agent performance metrics
- Pre-configured workflow templates
- Agent collaboration visualizations
