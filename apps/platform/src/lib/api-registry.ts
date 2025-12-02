/**
 * API Route Registry
 *
 * Complete list of all API endpoints in the Astralis system.
 * Used for health checks, documentation, and API discovery.
 */

export interface APIRoute {
  path: string;
  methods: readonly string[];
  description: string;
  category: string;
}

export const API_ROUTES: readonly APIRoute[] = [
  // Agent Routes
  { path: "/api/agent/analytics", methods: ["GET"], description: "Agent performance metrics and analytics", category: "Agent" },
  { path: "/api/agent/availability", methods: ["GET"], description: "Check user availability for date range", category: "Agent" },
  { path: "/api/agent/config", methods: ["GET", "PUT"], description: "Get/update agent configuration", category: "Agent" },
  { path: "/api/agent/decisions", methods: ["GET", "POST"], description: "List/trigger agent decisions", category: "Agent" },
  { path: "/api/agent/decisions/[id]", methods: ["GET"], description: "Get specific decision details", category: "Agent" },
  { path: "/api/agent/decisions/[id]/approve", methods: ["POST"], description: "Approve a pending decision", category: "Agent" },
  { path: "/api/agent/decisions/[id]/reject", methods: ["POST"], description: "Reject a pending decision", category: "Agent" },
  { path: "/api/agent/inbox", methods: ["GET", "POST"], description: "Agent inbox task management", category: "Agent" },
  { path: "/api/agent/inbox/[taskId]", methods: ["GET", "PATCH", "DELETE"], description: "Manage specific inbox task", category: "Agent" },
  { path: "/api/agent/init", methods: ["GET"], description: "Initialize agent system", category: "Agent" },
  { path: "/api/agent/process", methods: ["POST"], description: "Process input through agent", category: "Agent" },
  { path: "/api/agent/suggest", methods: ["POST"], description: "Get agent suggestions", category: "Agent" },

  // Authentication Routes
  { path: "/api/auth/[...nextauth]", methods: ["GET", "POST"], description: "NextAuth.js authentication handler", category: "Auth" },
  { path: "/api/auth/signup", methods: ["POST"], description: "User registration", category: "Auth" },
  { path: "/api/auth/accept-invite", methods: ["GET", "POST"], description: "Accept invitation to organization", category: "Auth" },

  // Automation Routes
  { path: "/api/automations", methods: ["GET", "POST"], description: "List/create automations", category: "Automation" },
  { path: "/api/automations/[id]", methods: ["GET", "PATCH", "DELETE"], description: "Manage specific automation", category: "Automation" },
  { path: "/api/automations/[id]/execute", methods: ["POST"], description: "Execute automation workflow", category: "Automation" },
  { path: "/api/automations/[id]/executions", methods: ["GET"], description: "List execution history", category: "Automation" },
  { path: "/api/automations/[id]/workflow", methods: ["GET"], description: "Get workflow definition", category: "Automation" },
  { path: "/api/automations/templates", methods: ["GET"], description: "List automation templates", category: "Automation" },
  { path: "/api/automations/templates/[id]/deploy", methods: ["POST"], description: "Deploy automation template", category: "Automation" },

  // Availability Rules
  { path: "/api/availability", methods: ["GET", "POST"], description: "Manage availability rules", category: "Calendar" },
  { path: "/api/availability/[id]", methods: ["PUT", "DELETE"], description: "Update/delete availability rule", category: "Calendar" },

  // Booking Routes
  { path: "/api/book", methods: ["GET", "POST"], description: "Public booking page", category: "Booking" },
  { path: "/api/booking", methods: ["POST"], description: "Create booking/consultation", category: "Booking" },
  { path: "/api/booking/availability", methods: ["GET"], description: "Get booking availability", category: "Booking" },
  { path: "/api/booking/events", methods: ["GET"], description: "List booking events", category: "Booking" },

  // Calendar Routes
  { path: "/api/calendar/callback", methods: ["GET"], description: "OAuth callback handler", category: "Calendar" },
  { path: "/api/calendar/connect", methods: ["POST"], description: "Connect calendar (OAuth)", category: "Calendar" },
  { path: "/api/calendar/disconnect", methods: ["POST"], description: "Disconnect calendar", category: "Calendar" },
  { path: "/api/calendar/events", methods: ["GET", "POST"], description: "List/create calendar events", category: "Calendar" },
  { path: "/api/calendar/events/[id]", methods: ["GET", "PUT", "DELETE"], description: "Manage calendar event", category: "Calendar" },
  { path: "/api/calendar/sync", methods: ["POST"], description: "Sync calendar events", category: "Calendar" },

  // Chat Routes
  { path: "/api/chat", methods: ["GET", "POST"], description: "RAG-powered document chat", category: "Chat" },
  { path: "/api/chat/[id]", methods: ["GET", "DELETE"], description: "Get/delete chat session", category: "Chat" },
  { path: "/api/chat/calendar", methods: ["POST"], description: "AI calendar assistant", category: "Chat" },

  // Contact
  { path: "/api/contact", methods: ["POST"], description: "Submit contact form", category: "Contact" },

  // Dashboard
  { path: "/api/dashboard/stats", methods: ["GET"], description: "Dashboard statistics", category: "Dashboard" },

  // Document Routes
  { path: "/api/documents", methods: ["GET", "DELETE"], description: "List/bulk delete documents", category: "Documents" },
  { path: "/api/documents/[id]", methods: ["GET", "PATCH", "DELETE"], description: "Manage document", category: "Documents" },
  { path: "/api/documents/[id]/download", methods: ["GET", "HEAD"], description: "Download document file", category: "Documents" },
  { path: "/api/documents/[id]/embed", methods: ["GET", "POST"], description: "Document embeddings", category: "Documents" },
  { path: "/api/documents/[id]/retry", methods: ["POST"], description: "Retry document processing", category: "Documents" },
  { path: "/api/documents/[id]/url", methods: ["GET"], description: "Get signed CDN URL", category: "Documents" },
  { path: "/api/documents/upload", methods: ["GET", "POST"], description: "Upload document file", category: "Documents" },
  { path: "/api/documents/search", methods: ["GET", "POST"], description: "Search documents", category: "Documents" },
  { path: "/api/documents/stats", methods: ["GET"], description: "Document statistics", category: "Documents" },

  // Health
  { path: "/api/health", methods: ["GET"], description: "System health check", category: "System" },

  // Intake Routes
  { path: "/api/intake", methods: ["GET", "POST"], description: "Manage intake requests", category: "Intake" },
  { path: "/api/intake/[id]", methods: ["PUT", "PATCH", "DELETE"], description: "Update/delete intake", category: "Intake" },
  { path: "/api/intake/[id]/assign", methods: ["POST"], description: "Assign intake to pipeline", category: "Intake" },
  { path: "/api/intake/bulk", methods: ["POST"], description: "Bulk create intake requests", category: "Intake" },

  // Integration Routes
  { path: "/api/integrations", methods: ["GET", "POST"], description: "Manage integrations", category: "Integrations" },
  { path: "/api/integrations/[provider]/[id]", methods: ["DELETE"], description: "Delete integration", category: "Integrations" },
  { path: "/api/integrations/[provider]/oauth/callback", methods: ["GET"], description: "OAuth callback", category: "Integrations" },

  // Organization Routes
  { path: "/api/orgs", methods: ["GET", "POST"], description: "List/create organizations", category: "Organizations" },
  { path: "/api/orgs/[id]/members", methods: ["GET", "POST", "DELETE", "PATCH"], description: "Manage org members", category: "Organizations" },
  { path: "/api/orgs/[id]/settings", methods: ["GET", "PUT"], description: "Organization settings", category: "Organizations" },

  // Pipeline Routes
  { path: "/api/pipelines", methods: ["GET", "POST"], description: "List/create pipelines", category: "Pipelines" },
  { path: "/api/pipelines/[id]", methods: ["GET", "PUT", "DELETE"], description: "Manage pipeline", category: "Pipelines" },
  { path: "/api/pipelines/[id]/items", methods: ["GET", "POST"], description: "Pipeline items", category: "Pipelines" },
  { path: "/api/pipelines/[id]/items/[itemId]", methods: ["GET", "PUT", "DELETE"], description: "Manage pipeline item", category: "Pipelines" },
  { path: "/api/pipelines/[id]/items/[itemId]/move", methods: ["POST"], description: "Move item between stages", category: "Pipelines" },
  { path: "/api/pipelines/[id]/stages", methods: ["GET", "POST"], description: "Pipeline stages", category: "Pipelines" },
  { path: "/api/pipelines/[id]/stages/[stageId]", methods: ["GET", "PUT", "DELETE"], description: "Manage pipeline stage", category: "Pipelines" },

  // Scheduling Routes
  { path: "/api/scheduling/conflicts", methods: ["POST"], description: "Detect scheduling conflicts", category: "Scheduling" },
  { path: "/api/scheduling/suggest", methods: ["POST"], description: "Get scheduling suggestions", category: "Scheduling" },

  // User Routes
  { path: "/api/users", methods: ["GET", "POST"], description: "List/create users", category: "Users" },
  { path: "/api/users/me", methods: ["GET", "PUT", "DELETE"], description: "Current user profile", category: "Users" },
  { path: "/api/users/me/avatar", methods: ["POST", "DELETE"], description: "User avatar management", category: "Users" },
  { path: "/api/users/me/password", methods: ["PUT"], description: "Change password", category: "Users" },
  { path: "/api/users/me/settings", methods: ["GET", "PUT", "PATCH", "DELETE"], description: "User settings", category: "Users" },

  // Webhook Routes
  { path: "/api/webhooks/automation", methods: ["GET", "POST"], description: "Automation webhooks", category: "Webhooks" },
  { path: "/api/webhooks/automation/[id]", methods: ["GET", "POST"], description: "Specific automation webhook", category: "Webhooks" },
  { path: "/api/webhooks/email", methods: ["GET", "POST"], description: "Email webhooks", category: "Webhooks" },
  { path: "/api/webhooks/form", methods: ["GET", "POST"], description: "Form submission webhooks", category: "Webhooks" },
] as const;

/**
 * Get routes grouped by category
 */
export function getRoutesByCategory(): Record<string, APIRoute[]> {
  return API_ROUTES.reduce(
    (acc, route) => {
      if (!acc[route.category]) acc[route.category] = [];
      acc[route.category].push(route);
      return acc;
    },
    {} as Record<string, APIRoute[]>
  );
}

/**
 * Get API counts by category
 */
export function getAPICounts(): Record<string, number> {
  return API_ROUTES.reduce(
    (acc, route) => {
      acc[route.category] = (acc[route.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}
