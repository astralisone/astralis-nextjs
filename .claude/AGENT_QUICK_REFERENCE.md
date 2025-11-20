# Astralis Multi-Agent System - Quick Reference

## Quick Agent Selection Guide

### "I need to build a new feature"
→ Start with: **Product Owner Agent** → **Systems Architect Agent** → **Frontend UI + Backend API Agents**

### "I need to create a new page"
→ Start with: **Content Writer Agent** → **Frontend UI Agent** → **Brand Consistency Agent**

### "I need to design an automation workflow"
→ Start with: **Product Owner Agent** → **Automation Agent** → **Backend API Agent**

### "I need to write documentation"
→ Use: **Documentation Agent**

### "I need to create a marketplace product"
→ Start with: **Marketplace Packaging Agent** → **Documentation Agent**

### "I need to review for brand compliance"
→ Use: **Brand Consistency Agent**

### "I need to plan deployment"
→ Use: **Deployment Agent** → **Systems Architect Agent**

### "I need test plans"
→ Use: **QA Agent**

## Agent Invocation Syntax

To invoke a specific agent role in your requests:

```
"Acting as the [Agent Name], please [task description]"
```

Examples:
- "Acting as the Product Owner Agent, define user stories for document upload"
- "Acting as the Frontend UI Agent, create the pricing page layout"
- "Acting as the Systems Architect Agent, design the Prisma schema for pipelines"

## Common Multi-Agent Workflows

### Complete Feature (Full Stack)
```
1. Product Owner → Define requirements
2. Systems Architect → Design architecture
3. Backend API → Build API endpoints
4. Frontend UI → Build UI components
5. QA → Create test plan
6. Documentation → Write guides
7. Brand Consistency → Review compliance
```

### New Marketing Page
```
1. Product Owner → Define page goals
2. Content Writer → Write copy
3. Frontend UI → Build layout
4. Brand Consistency → Review
5. Documentation → Update sitemap
```

### Automation Workflow
```
1. Product Owner → Define use case
2. Automation → Design n8n workflow
3. Backend API → Create webhook endpoints
4. Documentation → Write setup guide
5. QA → Test workflow scenarios
```

## Agent Collaboration Matrix

| Task Type | Primary Agent | Supporting Agents |
|-----------|---------------|-------------------|
| Feature Planning | Product Owner | Systems Architect |
| UI Implementation | Frontend UI | Brand Consistency, Content Writer |
| API Development | Backend API | Systems Architect, QA |
| Workflow Design | Automation | Backend API, QA |
| Content Creation | Content Writer | Brand Consistency |
| Architecture | Systems Architect | Backend API, Frontend UI |
| Testing | QA | All technical agents |
| Documentation | Documentation | All agents |
| Deployment | Deployment | Systems Architect, Backend API |
| Product Packaging | Marketplace Packaging | Documentation, Brand Consistency |

## Agent Output Formats

### Product Owner
- User stories: "As a [role], I want [capability], so that [benefit]"
- Acceptance criteria: Given/When/Then format
- Epics with child features

### Systems Architect
- Prisma models: `model User { ... }`
- Architecture diagrams: Mermaid or structured text
- Integration flows: Protocol specifications

### Frontend UI
- TSX components with TypeScript interfaces
- Tailwind utility classes
- Accessibility notes

### Backend API
- Next.js API route handlers
- Zod schemas
- Prisma queries

### Automation
- n8n workflow step descriptions
- Trigger → Node sequence
- Error handling strategies

### Documentation
- Markdown with sections: Overview, Setup, Configuration, Usage, Troubleshooting

### Content Writer
- Page sections: Heading, Subheading, Body, CTA
- Tone: Enterprise-grade, confident, outcome-focused

### Brand Consistency
- Three lists: Consistent, Issues, Recommendations

### QA
- Test cases: ID, Area, Scenario, Steps, Expected Result, Priority

### Deployment
- Step-by-step deployment instructions
- CI/CD YAML configurations
- Environment variable specifications

### Marketplace Packaging
- JSON metadata schemas
- Folder structures
- Product READMEs

## Brand Rules (All Agents Must Follow)

**Colors:**
- Astralis Navy: `#0A1B2B` (dark backgrounds, primary brand)
- Astralis Blue: `#2B6CB0` (accents, CTAs, links)
- Greys: Slate 100-900 (surfaces, text, borders)

**Typography:**
- Primary: Inter
- Secondary (optional): IBM Plex Sans

**Style:**
- Enterprise SaaS aesthetic
- Clean grids, ample white space
- Minimal motion (150-250ms transitions)
- Subtle shadows only

## Tech Stack (All Agents Must Follow)

**Frontend:**
- Next.js 16 (App Router)
- React + TypeScript
- Tailwind CSS

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL (DigitalOcean Managed)
- Zod validation

**Infrastructure:**
- DigitalOcean App Platform
- DigitalOcean Droplets (n8n, workers)
- DigitalOcean Spaces (file storage)

**Automation:**
- n8n workflows

## Tips for Effective Agent Use

1. **Be Specific**: Provide clear, detailed task descriptions
2. **Context Matters**: Reference related work or dependencies
3. **Sequential vs Parallel**: Use multiple agents in one request for parallel work
4. **Cross-Reference**: Agents should reference each other's outputs for consistency
5. **Iterate**: Use Brand Consistency Agent to review and refine
6. **Document**: Always include Documentation Agent for production features
7. **Test**: Include QA Agent for quality assurance

## Example Request Patterns

### Single Agent Request
```
"Acting as the Frontend UI Agent, create a responsive hero section
with the headline 'Automate Your Growth' using Astralis brand colors"
```

### Multi-Agent Request (Sequential)
```
"I need a complete feature for user profile management:
1. Product Owner: Define user stories
2. Systems Architect: Design Prisma User model
3. Backend API: Create /api/user endpoints
4. Frontend UI: Build profile edit form
5. QA: Create test plan"
```

### Multi-Agent Request (Parallel)
```
"Create the About page using:
- Content Writer: Draft all copy
- Frontend UI: Design layout
Run both in parallel, then use Brand Consistency Agent to review"
```

## Emergency Override

If you need to bypass the multi-agent system for urgent, simple tasks:
```
"Direct implementation request (skip orchestration): [your simple task]"
```

Use this only for trivial changes that don't require coordination.
