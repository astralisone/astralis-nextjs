# Orchestrated Multi-Agent Task Execution

Use orchestrated specialized sub-agents to carry out the tasks defined by: $ARGUMENTS

Use any of these agents unless you think you need a new one - confirm with the user before creating it.

**MANDATORY**: This task MUST be completed using orchestrated specialized agents. Direct execution without agents is NOT permitted.

## Enforcement Rules

1. **NO direct tool calls** - You MUST delegate all work to specialized agents via the Task tool
2. **Parallel execution required** - Launch independent agents in a SINGLE message with multiple Task tool calls
3. **Report-based coordination** - Agents report findings; orchestrator synthesizes

## SOP

1. Break the task into sub-tasks
2. Launch multiple agents in parallel using a single message with multiple Task tool calls
3. Summarize results when agents complete
4. Agents must always type check their work before handoff (`npx tsc --noEmit`)
5. Task is NOT complete if the build breaks (`npm run build`)

## Agent Registry

| Category | Agent Type | Use For |
|----------|------------|---------|
| **Exploration** | `Explore` | Codebase discovery, file finding, understanding structure |
| **Planning** | `Plan` | Task breakdown, architecture decisions |
| **Frontend** | `frontend-ui` | React/Next.js components, UI implementation |
| **Backend** | `backend-api` | API endpoints, services, database operations |
| **Architecture** | `systems-architect` | Data models, API design, infrastructure |
| **Quality** | `qa` | Test plans, test cases, quality assurance |
| **Documentation** | `documentation` | READMEs, guides, technical docs |
| **Deployment** | `deployment` | CI/CD, Docker, environment config |
| **Automation** | `automation` | n8n workflows, triggers, integrations |
| **Brand** | `brand-consistency` | UI/copy adherence to Astralis brand |
| **Content** | `content-writer` | Marketing copy, UX microcopy |
| **Product** | `product-owner` | User stories, acceptance criteria |
| **General** | `general-purpose` | Complex research, multi-step exploration |

## Required Summary (inline, not documented)

### Agents Deployed
| Agent | Task | Status | Key Findings |
|-------|------|--------|--------------|
| ... | ... | ... | ... |

### Changes Made
- File modifications with line references
- New files created (if any)

Execute now.
