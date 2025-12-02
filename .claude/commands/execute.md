# execute orchestration of Multi-Agent Task

Orchestrate multiple specialized sub-agents to complete: $ARGUMENTS

## Orchestration Protocol

You are the **astralis-orchestrator** coordinating specialized agents to complete complex tasks efficiently.

### Step 1: Task Analysis
1. Analyze the task: "$ARGUMENTS"
2. Break down into parallelizable sub-tasks
3. Identify dependencies between tasks
4. Determine which specialized agents are needed

### Step 2: Agent Selection
Select from available specialized agents based on task requirements:

**Code Quality Agents:**
- `pr-review-toolkit:code-reviewer` - Code review and best practices
- `pr-review-toolkit:code-simplifier` - Code simplification
- `pr-review-toolkit:silent-failure-hunter` - Find silent failures
- `pr-review-toolkit:type-design-analyzer` - Type design analysis

**Frontend Agents:**
- `frontend-excellence:react-specialist` - React/Next.js development
- `frontend-excellence:component-architect` - Component design
- `frontend-excellence:css-expert` - Styling and CSS
- `frontend-excellence:state-manager` - State management
- `frontend-excellence:frontend-optimizer` - Performance optimization

**Backend/Infrastructure Agents:**
- `backend-engineer` - API and backend services
- `devops-infrastructure-agent` - CI/CD and deployment
- `qa-test-automation-agent` - Testing and QA

**Research/Planning Agents:**
- `Explore` - Codebase exploration
- `Plan` - Task planning

### Step 3: Parallel Execution

Launch agents in parallel using a **single message with multiple Task tool calls**.

Each agent task MUST include:
1. Specific files/areas to work on
2. Expected deliverables
3. Type checking requirement: Check if tsc is running first (`pgrep -f "tsc"`), then run `npx tsc --noEmit` only if not already running
4. Structured report format for findings

### Step 4: Type Error Checking

**CRITICAL**: Every agent working with code must:
1. **Check if tsc is already running** before starting type check:
   ```bash
   # Check for existing tsc process
   if pgrep -f "tsc" > /dev/null; then
     echo "tsc already running, skipping type check"
   else
     npx tsc --noEmit
   fi
   ```
2. Run type check BEFORE making changes to establish baseline (if not already running)
3. Run type check AFTER changes to verify no new type errors introduced (if not already running)
4. Report any type errors found with file:line format
5. If tsc is already running, wait for it to complete or skip the check with a note

### Step 5: Results Aggregation

After all agents complete:
1. Collect reports from all agents
2. Identify any conflicts or overlapping changes
3. Summarize findings by category:
   - Bugs found and fixed
   - Type errors resolved
   - Improvements made
   - Issues requiring manual review
4. Run final type check: `npx tsc --noEmit`
5. Run build verification: `npm run build`

### Step 6: Final Report

Provide consolidated report with:
- Tasks completed by each agent
- Files modified
- Type safety verification status
- Build status
- Any remaining issues or recommendations

## Execution Guidelines

- **Maximize parallelism**: Launch independent agents simultaneously
- **Early type checking**: Verify types before and after each change
- **Structured communication**: Each agent reports in consistent format
- **Dependency awareness**: Sequential execution only when required
- **Error propagation**: Surface all errors immediately, no silent failures

## Example Usage

For task "fix authentication bugs":
1. Launch `Explore` agent to find auth-related files
2. Launch `pr-review-toolkit:silent-failure-hunter` for error handling issues
3. Launch `backend-engineer` to fix API auth endpoints
4. Launch `frontend-excellence:react-specialist` for auth UI components
5. Aggregate results and run final verification

Now execute the orchestration for: $ARGUMENTS
