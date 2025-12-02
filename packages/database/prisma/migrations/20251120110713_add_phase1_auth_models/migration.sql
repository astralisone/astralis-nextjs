-- CreateEnum
CREATE TYPE "AccessStatus" AS ENUM ('PENDING', 'GRANTED', 'DENIED');

-- CreateEnum
CREATE TYPE "AccessType" AS ENUM ('GITHUB', 'CLOUD', 'DATABASE', 'ANALYTICS', 'PM_TOOL', 'OTHER');

-- CreateEnum
CREATE TYPE "AuditBookingStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "AuditType" AS ENUM ('GENERAL', 'SALES_PROCESS', 'MARKETING_FUNNEL', 'PRICING_STRATEGY', 'CUSTOMER_RETENTION', 'DIGITAL_TRANSFORMATION', 'OPERATIONAL_EFFICIENCY');

-- CreateEnum
CREATE TYPE "BillingModel" AS ENUM ('TIME_AND_MATERIALS', 'FIXED_FEE', 'RETAINER');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "CalendarProvider" AS ENUM ('GOOGLE', 'OUTLOOK', 'APPLE', 'ZOOM', 'CALENDLY');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'PAUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ConsultationType" AS ENUM ('STRATEGY', 'TECHNICAL', 'IMPLEMENTATION', 'OPTIMIZATION', 'TRAINING', 'GENERAL');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESPONDED', 'CLOSED', 'EMAIL_FAILED');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('DIGITAL', 'CONSULTATION', 'DEVELOPMENT', 'DESIGN', 'MAINTENANCE', 'TRAINING');

-- CreateEnum
CREATE TYPE "DurationType" AS ENUM ('ONE_TIME', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'PROJECT_BASED');

-- CreateEnum
CREATE TYPE "EmailFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'COMPLAINED', 'FAILED');

-- CreateEnum
CREATE TYPE "EngagementStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('PENDING', 'SENT', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FollowUpType" AS ENUM ('EMAIL_REMINDER', 'EMAIL_THANK_YOU', 'EMAIL_FOLLOW_UP', 'EMAIL_PROPOSAL', 'INTERNAL_REMINDER', 'CALENDAR_EVENT');

-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ItemFulfillmentStatus" AS ENUM ('PENDING', 'PROCESSING', 'FULFILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('AVAILABLE', 'SOLD_OUT', 'COMING_SOON');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('PRODUCT', 'SERVICE');

-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('VIDEO_CALL', 'PHONE_CALL', 'IN_PERSON', 'HYBRID');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETE', 'INVOICED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CONFIRMATION', 'REMINDER_24H', 'REMINDER_2H', 'FOLLOW_UP', 'CANCELLATION', 'RESCHEDULE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PAYPAL', 'STRIPE', 'BANK_TRANSFER', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'UNSUBSCRIBED', 'BOUNCED', 'COMPLAINED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'AUTHOR', 'EDITOR', 'ADMIN', 'PM', 'OPERATOR', 'CLIENT');

-- CreateEnum
CREATE TYPE "IntakeSource" AS ENUM ('FORM', 'EMAIL', 'CHAT', 'API');

-- CreateEnum
CREATE TYPE "IntakeStatus" AS ENUM ('NEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "automation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "workflowId" TEXT,
    "webhookUrl" TEXT,
    "triggerConfig" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "runCount" INTEGER NOT NULL DEFAULT 0,
    "lastRunAt" TIMESTAMP(3),
    "orgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessRequest" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "type" "AccessType" NOT NULL,
    "details" VARCHAR(500) NOT NULL,
    "requestedFor" VARCHAR(100) NOT NULL,
    "status" "AccessStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" VARCHAR(50) NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientCall" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "phone" TEXT,

    CONSTRAINT "ClientCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "website" VARCHAR(255) NOT NULL,
    "industry" VARCHAR(50) NOT NULL,
    "size" VARCHAR(20) NOT NULL,
    "billingEmail" VARCHAR(255) NOT NULL,
    "billingAddress" VARCHAR(500) NOT NULL,
    "notes" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "firstName" VARCHAR(50) NOT NULL,
    "lastName" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Engagement" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" "EngagementStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3),
    "targetEndDate" TIMESTAMP(3),
    "budgetCurrency" VARCHAR(3) NOT NULL,
    "budgetAmount" DECIMAL(12,2) NOT NULL,
    "billingModel" "BillingModel" NOT NULL,
    "scopeSummary" VARCHAR(2000) NOT NULL,
    "acceptanceCriteria" VARCHAR(2000) NOT NULL,
    "repoStrategy" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Engagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngagementStakeholder" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngagementStakeholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Environment" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "notes" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Environment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MarketplaceItemToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MarketplaceItemToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PostToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PostToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "ai_optimization_reports" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "industry" TEXT,
    "businessSize" TEXT,
    "currentTools" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "painPoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reportSent" BOOLEAN NOT NULL DEFAULT false,
    "reportData" JSONB,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_optimization_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_availability" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "maxBookings" INTEGER NOT NULL DEFAULT 1,
    "bufferMinutes" INTEGER NOT NULL DEFAULT 15,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "assignedToId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_blocked_dates" (
    "id" TEXT NOT NULL,
    "blockedDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_blocked_dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_bookings" (
    "id" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT,
    "companyName" TEXT,
    "companySize" TEXT,
    "industry" TEXT,
    "auditType" "AuditType" NOT NULL DEFAULT 'GENERAL',
    "currentRevenue" TEXT,
    "painPoints" TEXT[],
    "goals" TEXT[],
    "additionalNotes" TEXT,
    "confirmationSent" BOOLEAN NOT NULL DEFAULT false,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "meetingLink" TEXT,
    "calendarEventId" TEXT,
    "adminNotes" TEXT,
    "preparationNotes" TEXT,
    "followUpActions" TEXT[],
    "assignedToId" TEXT,
    "userId" TEXT,
    "auditCompleted" BOOLEAN NOT NULL DEFAULT false,
    "auditResults" JSONB,
    "recommendedActions" TEXT[],
    "followUpScheduled" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "AuditBookingStatus" NOT NULL DEFAULT 'SCHEDULED',

    CONSTRAINT "audit_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_notifications" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "recipientEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttempt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "auditType" "AuditType" NOT NULL,
    "sections" JSONB NOT NULL,
    "questions" JSONB NOT NULL,
    "checklists" JSONB NOT NULL,
    "estimatedDuration" INTEGER NOT NULL DEFAULT 60,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_integrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "CalendarProvider" NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "defaultCalendarId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "consultationType" "ConsultationType" NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER NOT NULL DEFAULT 30,
    "timeZone" TEXT NOT NULL DEFAULT 'UTC',
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT,
    "company" TEXT,
    "teamSize" INTEGER,
    "industry" TEXT,
    "meetingType" "MeetingType" NOT NULL DEFAULT 'VIDEO_CALL',
    "meetingUrl" TEXT,
    "meetingId" TEXT,
    "meetingPassword" TEXT,
    "objectives" TEXT,
    "currentSituation" TEXT,
    "desiredOutcome" TEXT,
    "budget" TEXT,
    "timeline" TEXT,
    "specificQuestions" TEXT,
    "consultationNotes" TEXT,
    "actionItems" JSONB,
    "proposalGenerated" BOOLEAN NOT NULL DEFAULT false,
    "proposalUrl" TEXT,
    "internalNotes" TEXT,
    "assignedToId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_forms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT,
    "status" "ContactStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_ups" (
    "id" TEXT NOT NULL,
    "type" "FollowUpType" NOT NULL,
    "status" "FollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "revenueAuditId" TEXT,
    "consultationId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "status" "ItemStatus" NOT NULL DEFAULT 'AVAILABLE',
    "categoryId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "specifications" JSONB,
    "features" TEXT[],
    "stock" INTEGER NOT NULL DEFAULT 0,
    "weight" DECIMAL(10,2) NOT NULL,
    "dimensions" JSONB,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,
    "compatibility" TEXT[],
    "complexity_level" TEXT,
    "consultation_required" BOOLEAN NOT NULL DEFAULT false,
    "custom_pricing" BOOLEAN NOT NULL DEFAULT false,
    "deliverables" TEXT[],
    "delivery_method" "DeliveryMethod",
    "demo_url" TEXT,
    "digital_download_url" TEXT,
    "discount_price" DECIMAL(10,2) NOT NULL,
    "documentation_url" TEXT,
    "duration_type" "DurationType",
    "duration_unit" TEXT,
    "estimated_duration" INTEGER,
    "faq" JSONB,
    "gallery_images" TEXT[],
    "industry_focus" TEXT[],
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "item_type" "ItemType" NOT NULL DEFAULT 'SERVICE',
    "license_type" TEXT,
    "max_order_quantity" INTEGER,
    "min_order_quantity" INTEGER NOT NULL DEFAULT 1,
    "prerequisites" TEXT[],
    "price_range_max" DECIMAL(10,2) NOT NULL,
    "price_range_min" DECIMAL(10,2) NOT NULL,
    "rating_average" DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "recurring_interval" TEXT,
    "revision_limit" INTEGER,
    "service_excludes" TEXT[],
    "service_includes" TEXT[],
    "setup_fee" DECIMAL(10,2) NOT NULL,
    "support_duration" INTEGER,
    "support_duration_unit" TEXT,
    "system_requirements" JSONB,
    "target_audience" TEXT[],
    "technology_stack" TEXT[],
    "testimonials" JSONB,
    "video_url" TEXT,
    "paypalProductId" TEXT NOT NULL,

    CONSTRAINT "marketplace_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "preheader" TEXT,
    "content" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "segmentCriteria" JSONB,
    "templateId" TEXT,
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "totalSent" INTEGER NOT NULL DEFAULT 0,
    "totalDelivered" INTEGER NOT NULL DEFAULT 0,
    "totalOpened" INTEGER NOT NULL DEFAULT 0,
    "totalClicked" INTEGER NOT NULL DEFAULT 0,
    "totalUnsubscribed" INTEGER NOT NULL DEFAULT 0,
    "totalBounced" INTEGER NOT NULL DEFAULT 0,
    "totalComplained" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_emails" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "complainedAt" TIMESTAMP(3),
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "source" TEXT,
    "confirmationToken" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "lastEmailSent" TIMESTAMP(3),
    "lastOpenedEmail" TIMESTAMP(3),
    "lastClickedEmail" TIMESTAMP(3),
    "totalEmailsSent" INTEGER NOT NULL DEFAULT 0,
    "totalEmailsOpened" INTEGER NOT NULL DEFAULT 0,
    "totalEmailsClicked" INTEGER NOT NULL DEFAULT 0,
    "unsubscribeToken" TEXT NOT NULL,
    "unsubscribeReason" TEXT,
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "variables" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "marketplaceItemId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "itemType" "ItemType",
    "digitalDownloadUrl" TEXT,
    "licenseKey" TEXT,
    "customizations" JSONB,
    "fulfillmentStatus" "ItemFulfillmentStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "total" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "taxAmount" DECIMAL(10,2) NOT NULL,
    "shippingAmount" DECIMAL(10,2) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "billingAddress" JSONB,
    "shippingAddress" JSONB,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT,
    "paymentData" JSONB,
    "userId" TEXT,
    "fulfillmentStatus" "FulfillmentStatus" NOT NULL DEFAULT 'PENDING',
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "trackingNumber" TEXT,
    "notes" TEXT,
    "internalNotes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "featuredImage" TEXT,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "keywords" TEXT[],
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER,
    "locale" TEXT NOT NULL DEFAULT 'en',

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_audits" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Revenue Operations Audit',
    "description" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER NOT NULL DEFAULT 60,
    "timeZone" TEXT NOT NULL DEFAULT 'UTC',
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT,
    "company" TEXT,
    "teamSize" INTEGER,
    "industry" TEXT,
    "currentChallenges" TEXT,
    "specificAreas" TEXT[],
    "meetingType" "MeetingType" NOT NULL DEFAULT 'VIDEO_CALL',
    "meetingUrl" TEXT,
    "meetingId" TEXT,
    "meetingPassword" TEXT,
    "revenueGoals" TEXT,
    "currentSystems" TEXT[],
    "painPoints" TEXT,
    "expectedOutcomes" TEXT,
    "auditResults" TEXT,
    "recommendations" JSONB,
    "followUpScheduled" BOOLEAN NOT NULL DEFAULT false,
    "nextSteps" TEXT,
    "internalNotes" TEXT,
    "assignedToId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revenue_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriber_preferences" (
    "id" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "blogUpdates" BOOLEAN NOT NULL DEFAULT true,
    "productUpdates" BOOLEAN NOT NULL DEFAULT true,
    "marketplaceUpdates" BOOLEAN NOT NULL DEFAULT true,
    "eventNotifications" BOOLEAN NOT NULL DEFAULT false,
    "specialOffers" BOOLEAN NOT NULL DEFAULT false,
    "frequency" "EmailFrequency" NOT NULL DEFAULT 'WEEKLY',
    "categoryInterests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tagInterests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredTime" TEXT,
    "timezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriber_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "authorId" TEXT NOT NULL,
    "role" TEXT,
    "company" TEXT,
    "avatar" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "additionalInfo" TEXT,
    "budget" TEXT,
    "businessGoals" TEXT,
    "company" TEXT,
    "interestArea" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "teamSize" TEXT,
    "timeline" TEXT,
    "orgId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlists" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "orgId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "changes" JSONB,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intakeRequest" (
    "id" TEXT NOT NULL,
    "source" "IntakeSource" NOT NULL,
    "status" "IntakeStatus" NOT NULL DEFAULT 'NEW',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "requestData" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "orgId" TEXT NOT NULL,
    "assignedPipeline" TEXT,
    "aiRoutingMeta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intakeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipeline" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "orgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pipeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipelineStage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "pipelineId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pipelineStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipelineItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "stageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pipelineItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "automation_orgId_idx" ON "automation"("orgId");

-- CreateIndex
CREATE INDEX "automation_isActive_idx" ON "automation"("isActive");

-- CreateIndex
CREATE INDEX "AccessRequest_engagementId_idx" ON "AccessRequest"("engagementId");

-- CreateIndex
CREATE INDEX "AccessRequest_engagementId_status_idx" ON "AccessRequest"("engagementId", "status");

-- CreateIndex
CREATE INDEX "AccessRequest_status_idx" ON "AccessRequest"("status");

-- CreateIndex
CREATE INDEX "AccessRequest_type_idx" ON "AccessRequest"("type");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "Company_billingEmail_idx" ON "Company"("billingEmail");

-- CreateIndex
CREATE INDEX "Company_createdAt_idx" ON "Company"("createdAt");

-- CreateIndex
CREATE INDEX "Company_name_idx" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_email_key" ON "Contact"("email");

-- CreateIndex
CREATE INDEX "Contact_companyId_idx" ON "Contact"("companyId");

-- CreateIndex
CREATE INDEX "Contact_companyId_isPrimary_idx" ON "Contact"("companyId", "isPrimary");

-- CreateIndex
CREATE INDEX "Contact_createdAt_idx" ON "Contact"("createdAt");

-- CreateIndex
CREATE INDEX "Contact_email_idx" ON "Contact"("email");

-- CreateIndex
CREATE INDEX "Engagement_companyId_idx" ON "Engagement"("companyId");

-- CreateIndex
CREATE INDEX "Engagement_companyId_status_idx" ON "Engagement"("companyId", "status");

-- CreateIndex
CREATE INDEX "Engagement_createdAt_idx" ON "Engagement"("createdAt");

-- CreateIndex
CREATE INDEX "Engagement_startDate_idx" ON "Engagement"("startDate");

-- CreateIndex
CREATE INDEX "Engagement_status_idx" ON "Engagement"("status");

-- CreateIndex
CREATE INDEX "EngagementStakeholder_contactId_idx" ON "EngagementStakeholder"("contactId");

-- CreateIndex
CREATE INDEX "EngagementStakeholder_engagementId_idx" ON "EngagementStakeholder"("engagementId");

-- CreateIndex
CREATE UNIQUE INDEX "EngagementStakeholder_engagementId_contactId_key" ON "EngagementStakeholder"("engagementId", "contactId");

-- CreateIndex
CREATE INDEX "Environment_engagementId_idx" ON "Environment"("engagementId");

-- CreateIndex
CREATE INDEX "Environment_name_idx" ON "Environment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Environment_engagementId_name_key" ON "Environment"("engagementId", "name");

-- CreateIndex
CREATE INDEX "Milestone_dueDate_idx" ON "Milestone"("dueDate");

-- CreateIndex
CREATE INDEX "Milestone_engagementId_idx" ON "Milestone"("engagementId");

-- CreateIndex
CREATE INDEX "Milestone_engagementId_status_idx" ON "Milestone"("engagementId", "status");

-- CreateIndex
CREATE INDEX "Milestone_status_idx" ON "Milestone"("status");

-- CreateIndex
CREATE INDEX "_MarketplaceItemToTag_B_index" ON "_MarketplaceItemToTag"("B");

-- CreateIndex
CREATE INDEX "_PostToTag_B_index" ON "_PostToTag"("B");

-- CreateIndex
CREATE INDEX "ai_optimization_reports_createdAt_idx" ON "ai_optimization_reports"("createdAt");

-- CreateIndex
CREATE INDEX "ai_optimization_reports_email_idx" ON "ai_optimization_reports"("email");

-- CreateIndex
CREATE INDEX "ai_optimization_reports_industry_idx" ON "ai_optimization_reports"("industry");

-- CreateIndex
CREATE INDEX "ai_optimization_reports_reportSent_idx" ON "ai_optimization_reports"("reportSent");

-- CreateIndex
CREATE INDEX "audit_availability_assignedToId_idx" ON "audit_availability"("assignedToId");

-- CreateIndex
CREATE INDEX "audit_availability_dayOfWeek_idx" ON "audit_availability"("dayOfWeek");

-- CreateIndex
CREATE INDEX "audit_availability_effectiveFrom_effectiveTo_idx" ON "audit_availability"("effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE INDEX "audit_availability_isAvailable_idx" ON "audit_availability"("isAvailable");

-- CreateIndex
CREATE INDEX "audit_blocked_dates_assignedToId_idx" ON "audit_blocked_dates"("assignedToId");

-- CreateIndex
CREATE INDEX "audit_blocked_dates_blockedDate_idx" ON "audit_blocked_dates"("blockedDate");

-- CreateIndex
CREATE INDEX "audit_bookings_assignedToId_idx" ON "audit_bookings"("assignedToId");

-- CreateIndex
CREATE INDEX "audit_bookings_auditType_idx" ON "audit_bookings"("auditType");

-- CreateIndex
CREATE INDEX "audit_bookings_clientEmail_idx" ON "audit_bookings"("clientEmail");

-- CreateIndex
CREATE INDEX "audit_bookings_createdAt_idx" ON "audit_bookings"("createdAt");

-- CreateIndex
CREATE INDEX "audit_bookings_scheduledDate_idx" ON "audit_bookings"("scheduledDate");

-- CreateIndex
CREATE INDEX "audit_bookings_status_idx" ON "audit_bookings"("status");

-- CreateIndex
CREATE INDEX "audit_notifications_bookingId_idx" ON "audit_notifications"("bookingId");

-- CreateIndex
CREATE INDEX "audit_notifications_scheduledFor_idx" ON "audit_notifications"("scheduledFor");

-- CreateIndex
CREATE INDEX "audit_notifications_sent_idx" ON "audit_notifications"("sent");

-- CreateIndex
CREATE INDEX "audit_notifications_type_idx" ON "audit_notifications"("type");

-- CreateIndex
CREATE INDEX "audit_templates_auditType_idx" ON "audit_templates"("auditType");

-- CreateIndex
CREATE INDEX "audit_templates_isActive_idx" ON "audit_templates"("isActive");

-- CreateIndex
CREATE INDEX "calendar_integrations_provider_idx" ON "calendar_integrations"("provider");

-- CreateIndex
CREATE INDEX "calendar_integrations_userId_idx" ON "calendar_integrations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "calendar_integrations_userId_provider_key" ON "calendar_integrations"("userId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "consultations_assignedToId_idx" ON "consultations"("assignedToId");

-- CreateIndex
CREATE INDEX "consultations_clientEmail_idx" ON "consultations"("clientEmail");

-- CreateIndex
CREATE INDEX "consultations_consultationType_idx" ON "consultations"("consultationType");

-- CreateIndex
CREATE INDEX "consultations_createdAt_idx" ON "consultations"("createdAt");

-- CreateIndex
CREATE INDEX "consultations_scheduledAt_idx" ON "consultations"("scheduledAt");

-- CreateIndex
CREATE INDEX "consultations_status_idx" ON "consultations"("status");

-- CreateIndex
CREATE INDEX "follow_ups_consultationId_idx" ON "follow_ups"("consultationId");

-- CreateIndex
CREATE INDEX "follow_ups_revenueAuditId_idx" ON "follow_ups"("revenueAuditId");

-- CreateIndex
CREATE INDEX "follow_ups_scheduledAt_idx" ON "follow_ups"("scheduledAt");

-- CreateIndex
CREATE INDEX "follow_ups_status_idx" ON "follow_ups"("status");

-- CreateIndex
CREATE INDEX "follow_ups_type_idx" ON "follow_ups"("type");

-- CreateIndex
CREATE UNIQUE INDEX "likes_postId_userId_key" ON "likes"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_items_slug_key" ON "marketplace_items"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_items_paypalProductId_key" ON "marketplace_items"("paypalProductId");

-- CreateIndex
CREATE INDEX "newsletter_campaigns_createdAt_idx" ON "newsletter_campaigns"("createdAt");

-- CreateIndex
CREATE INDEX "newsletter_campaigns_scheduledAt_idx" ON "newsletter_campaigns"("scheduledAt");

-- CreateIndex
CREATE INDEX "newsletter_campaigns_sentAt_idx" ON "newsletter_campaigns"("sentAt");

-- CreateIndex
CREATE INDEX "newsletter_campaigns_status_idx" ON "newsletter_campaigns"("status");

-- CreateIndex
CREATE INDEX "newsletter_emails_campaignId_idx" ON "newsletter_emails"("campaignId");

-- CreateIndex
CREATE INDEX "newsletter_emails_openedAt_idx" ON "newsletter_emails"("openedAt");

-- CreateIndex
CREATE INDEX "newsletter_emails_sentAt_idx" ON "newsletter_emails"("sentAt");

-- CreateIndex
CREATE INDEX "newsletter_emails_status_idx" ON "newsletter_emails"("status");

-- CreateIndex
CREATE INDEX "newsletter_emails_subscriberId_idx" ON "newsletter_emails"("subscriberId");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_emails_campaignId_subscriberId_key" ON "newsletter_emails"("campaignId", "subscriberId");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_confirmationToken_key" ON "newsletter_subscribers"("confirmationToken");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_unsubscribeToken_key" ON "newsletter_subscribers"("unsubscribeToken");

-- CreateIndex
CREATE INDEX "newsletter_subscribers_confirmationToken_idx" ON "newsletter_subscribers"("confirmationToken");

-- CreateIndex
CREATE INDEX "newsletter_subscribers_createdAt_idx" ON "newsletter_subscribers"("createdAt");

-- CreateIndex
CREATE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE INDEX "newsletter_subscribers_status_confirmedAt_idx" ON "newsletter_subscribers"("status", "confirmedAt");

-- CreateIndex
CREATE INDEX "newsletter_subscribers_status_idx" ON "newsletter_subscribers"("status");

-- CreateIndex
CREATE INDEX "newsletter_subscribers_unsubscribeToken_idx" ON "newsletter_subscribers"("unsubscribeToken");

-- CreateIndex
CREATE INDEX "newsletter_templates_isActive_idx" ON "newsletter_templates"("isActive");

-- CreateIndex
CREATE INDEX "newsletter_templates_isDefault_idx" ON "newsletter_templates"("isDefault");

-- CreateIndex
CREATE INDEX "order_items_marketplaceItemId_idx" ON "order_items"("marketplaceItemId");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");

-- CreateIndex
CREATE INDEX "orders_customerEmail_idx" ON "orders"("customerEmail");

-- CreateIndex
CREATE INDEX "orders_orderNumber_idx" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_paymentStatus_idx" ON "orders"("paymentStatus");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_userId_idx" ON "orders"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expiresAt_idx" ON "password_reset_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE INDEX "revenue_audits_assignedToId_idx" ON "revenue_audits"("assignedToId");

-- CreateIndex
CREATE INDEX "revenue_audits_clientEmail_idx" ON "revenue_audits"("clientEmail");

-- CreateIndex
CREATE INDEX "revenue_audits_createdAt_idx" ON "revenue_audits"("createdAt");

-- CreateIndex
CREATE INDEX "revenue_audits_scheduledAt_idx" ON "revenue_audits"("scheduledAt");

-- CreateIndex
CREATE INDEX "revenue_audits_status_idx" ON "revenue_audits"("status");

-- CreateIndex
CREATE UNIQUE INDEX "subscriber_preferences_subscriberId_key" ON "subscriber_preferences"("subscriberId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "users_orgId_idx" ON "users"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_userId_itemId_key" ON "wishlists"("userId", "itemId");

-- CreateIndex
CREATE INDEX "organization_name_idx" ON "organization"("name");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_sessionToken_idx" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE INDEX "VerificationToken_token_idx" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "ActivityLog_orgId_idx" ON "ActivityLog"("orgId");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_entity_entityId_idx" ON "ActivityLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "intakeRequest_orgId_idx" ON "intakeRequest"("orgId");

-- CreateIndex
CREATE INDEX "intakeRequest_status_idx" ON "intakeRequest"("status");

-- CreateIndex
CREATE INDEX "intakeRequest_source_idx" ON "intakeRequest"("source");

-- CreateIndex
CREATE INDEX "intakeRequest_createdAt_idx" ON "intakeRequest"("createdAt");

-- CreateIndex
CREATE INDEX "pipeline_orgId_idx" ON "pipeline"("orgId");

-- CreateIndex
CREATE INDEX "pipeline_isActive_idx" ON "pipeline"("isActive");

-- CreateIndex
CREATE INDEX "pipelineStage_pipelineId_idx" ON "pipelineStage"("pipelineId");

-- CreateIndex
CREATE INDEX "pipelineStage_order_idx" ON "pipelineStage"("order");

-- CreateIndex
CREATE INDEX "pipelineItem_stageId_idx" ON "pipelineItem"("stageId");

-- CreateIndex
CREATE INDEX "pipelineItem_createdAt_idx" ON "pipelineItem"("createdAt");

-- AddForeignKey
ALTER TABLE "automation" ADD CONSTRAINT "automation_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRequest" ADD CONSTRAINT "AccessRequest_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementStakeholder" ADD CONSTRAINT "EngagementStakeholder_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementStakeholder" ADD CONSTRAINT "EngagementStakeholder_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Environment" ADD CONSTRAINT "Environment_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MarketplaceItemToTag" ADD CONSTRAINT "_MarketplaceItemToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "marketplace_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MarketplaceItemToTag" ADD CONSTRAINT "_MarketplaceItemToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToTag" ADD CONSTRAINT "_PostToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToTag" ADD CONSTRAINT "_PostToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_availability" ADD CONSTRAINT "audit_availability_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_blocked_dates" ADD CONSTRAINT "audit_blocked_dates_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_bookings" ADD CONSTRAINT "audit_bookings_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_bookings" ADD CONSTRAINT "audit_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_notifications" ADD CONSTRAINT "audit_notifications_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "audit_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_integrations" ADD CONSTRAINT "calendar_integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_revenueAuditId_fkey" FOREIGN KEY ("revenueAuditId") REFERENCES "revenue_audits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_items" ADD CONSTRAINT "marketplace_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_items" ADD CONSTRAINT "marketplace_items_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_campaigns" ADD CONSTRAINT "newsletter_campaigns_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "newsletter_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_emails" ADD CONSTRAINT "newsletter_emails_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "newsletter_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_emails" ADD CONSTRAINT "newsletter_emails_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "newsletter_subscribers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_marketplaceItemId_fkey" FOREIGN KEY ("marketplaceItemId") REFERENCES "marketplace_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_audits" ADD CONSTRAINT "revenue_audits_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_audits" ADD CONSTRAINT "revenue_audits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriber_preferences" ADD CONSTRAINT "subscriber_preferences_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "newsletter_subscribers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "marketplace_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intakeRequest" ADD CONSTRAINT "intakeRequest_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intakeRequest" ADD CONSTRAINT "intakeRequest_assignedPipeline_fkey" FOREIGN KEY ("assignedPipeline") REFERENCES "pipeline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipelineStage" ADD CONSTRAINT "pipelineStage_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "pipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipelineItem" ADD CONSTRAINT "pipelineItem_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "pipelineStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
