# Astralis One Copy Standards

This document defines the messaging patterns and copy standards for the Astralis One platform. Consistent, clear communication builds user trust and reduces confusion. All team members should reference these guidelines when writing user-facing text.

## Core Principles

1. **Be clear** - Users should understand immediately what happened and what to do next
2. **Be helpful** - Always provide a path forward, especially in error states
3. **Be brief** - Respect users' time with concise messaging
4. **Be consistent** - Use the same terms and patterns across the platform

---

## Error Messages

**Pattern:** "[Action] failed. [Reason]. [Next step]"

### Examples

| Context | Message |
|---------|---------|
| Sign-in | Sign-in failed. Invalid credentials. Please check your email and password. |
| Pipeline creation | Pipeline creation failed. Name is required. Please provide a name. |
| Assignment | Assignment failed. Pipeline is full. Choose another pipeline or contact support. |
| File upload | Upload failed. File too large. Maximum size is 10MB. |
| Network | Connection failed. Please check your internet and try again. |
| Permission | Access denied. You don't have permission to perform this action. Contact your admin. |
| Not found | Resource not found. It may have been deleted or moved. |

### Don'ts
- "Something went wrong" (too vague)
- "Error: 500" (technical jargon)
- "Oops!" (too casual for enterprise)

---

## Success Messages

**Pattern:** "[Action] complete." or "[Action] [result]."

### Examples

| Context | Message |
|---------|---------|
| Create | Pipeline created successfully. |
| Assign | Intake assigned to Sales Pipeline. |
| Upload | 3 documents uploaded successfully. |
| Save | Settings saved. |
| Invite | Invitation sent to john@example.com. |
| Delete | Pipeline deleted. |

### Don'ts
- "Awesome! You did it!" (over-enthusiastic)
- "Success!" alone (no context)

---

## Empty States

**Pattern:** "[Entity title] / [Encouraging subtitle] / [CTA button]"

### Examples

| Page | Title | Subtitle | CTA |
|------|-------|----------|-----|
| Pipelines | No pipelines yet | Create your first pipeline to start organizing workflow | Create Pipeline |
| Documents | No documents | Upload files to start organizing and searching | Upload Documents |
| Intake | No requests | Requests will appear here when submitted | Create Request |
| Automations | No automations | Set up workflows to automate repetitive tasks | Create Automation |
| Team | No team members | Invite colleagues to collaborate on projects | Invite Team |

---

## Confirmation Dialogs

**Pattern:** "[Question]? [Consequence]. / [Primary CTA] / [Secondary CTA]"

### Examples

| Action | Title | Body | Primary | Secondary |
|--------|-------|------|---------|-----------|
| Delete pipeline | Delete this pipeline? | This action cannot be undone. All items will be removed. | Delete | Cancel |
| Archive request | Archive this request? | It will be moved to the archive and hidden from active views. | Archive | Cancel |
| Remove member | Remove this team member? | They will lose access to all organization resources. | Remove | Cancel |

### Rules
- Primary (destructive) button: Red, right side
- Secondary (cancel) button: Neutral, left side
- Always allow cancel via Escape key or clicking outside

---

## Form Labels & Placeholders

### Labels
- Use sentence case: "Pipeline name" not "Pipeline Name"
- No colon after labels
- Mark required fields: "Pipeline name (required)"

### Placeholders
- Action-oriented: "Enter pipeline name..." not "Pipeline name here"
- Examples when helpful: "e.g., Sales Pipeline"

### Examples

| Field | Label | Placeholder |
|-------|-------|-------------|
| Name | Pipeline name (required) | Enter pipeline name... |
| Email | Email address | you@company.com |
| Description | Description | Describe this pipeline... |
| Search | Search | Search documents... |

---

## Button Labels

### Primary Actions (main CTA)
- Single action verb: Create, Save, Submit, Send, Upload

### Secondary Actions
- Verb + noun: View Details, Edit Settings, Download Report

### Destructive Actions
- "Delete [noun]" or "Remove [noun]"
- Never just "Delete" without context in dialogs

### Cancel
- Always "Cancel" not "Close", "Nevermind", or "Go Back"

### Examples

| Context | Primary | Secondary |
|---------|---------|-----------|
| Create form | Create Pipeline | Cancel |
| Edit form | Save Changes | Cancel |
| Upload dialog | Upload | Cancel |
| Confirmation | Delete Pipeline | Cancel |

---

## Loading States

**Pattern:** "[Action]..." or "Loading [resource]..."

### Examples
- Creating pipeline...
- Uploading documents...
- Loading dashboard...
- Saving changes...
- Processing request...

---

## Tone Guidelines

### Do
- Professional but approachable
- Action-oriented (use imperatives: "Create", "Upload", "Select")
- Confident ("will" not "should")
- Specific (mention what was affected)
- Helpful (include next steps in errors)

### Don't
- Overly casual ("Oops!", "Yay!")
- Technical jargon ("Error 500", "null reference")
- Blame the user ("You made a mistake")
- Vague ("Something went wrong")
- Excessive enthusiasm ("Amazing! Fantastic!")

---

## Common Terms

Use these terms consistently across the platform:

| Use | Don't Use |
|-----|-----------|
| Pipeline | Workflow, Board, Kanban |
| Intake | Request, Ticket, Submission |
| Document | File, Attachment, Upload |
| Automation | Workflow, Rule, Trigger |
| Organization | Company, Workspace, Account |
| Team member | User, Member, Collaborator |

---

## Quick Reference Checklist

When writing copy, verify:

- [ ] Clear action verb at the start
- [ ] Specific context (what was affected)
- [ ] Next step provided for errors
- [ ] No technical jargon
- [ ] Consistent with common terms list
- [ ] Appropriate length (brief but complete)
