self.__BUILD_MANIFEST = {
  "/book-consultation": [
    "static/chunks/pages/book-consultation.js"
  ],
  "/book-revenue-audit": [
    "static/chunks/pages/book-revenue-audit.js"
  ],
  "/booking-success": [
    "static/chunks/pages/booking-success.js"
  ],
  "__rewrites": {
    "afterFiles": [
      {
        "source": "/api/:path*"
      }
    ],
    "beforeFiles": [],
    "fallback": []
  },
  "sortedPages": [
    "/NewsletterPage",
    "/WorkflowDemoPage",
    "/_app",
    "/_error",
    "/admin",
    "/admin/EngagementManagementPage",
    "/admin/blog",
    "/admin/blog/categories",
    "/admin/blog/new",
    "/admin/blog/tags",
    "/admin/blog/[id]/edit",
    "/admin/marketplace",
    "/admin/marketplace/new",
    "/admin/marketplace/[id]/edit",
    "/book-consultation",
    "/book-revenue-audit",
    "/booking-success",
    "/checkout",
    "/forgot-password",
    "/login",
    "/onboarding",
    "/orders",
    "/register",
    "/reset-password",
    "/services/content-generation",
    "/services/customer-service",
    "/services/data-analytics",
    "/services/sales-pipeline",
    "/services/wizard"
  ]
};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()