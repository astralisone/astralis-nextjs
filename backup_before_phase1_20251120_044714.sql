--
-- PostgreSQL database dump
--

\restrict qCqeOcqarap1yGLvxfKSrwG1giQW0cVT8Oa9nrhXTpwRqdw8dREGpduQ2VFhxBx

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 14.19 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AccessStatus; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."AccessStatus" AS ENUM (
    'PENDING',
    'GRANTED',
    'DENIED'
);


ALTER TYPE public."AccessStatus" OWNER TO gstarr;

--
-- Name: AccessType; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."AccessType" AS ENUM (
    'GITHUB',
    'CLOUD',
    'DATABASE',
    'ANALYTICS',
    'PM_TOOL',
    'OTHER'
);


ALTER TYPE public."AccessType" OWNER TO gstarr;

--
-- Name: AuditBookingStatus; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."AuditBookingStatus" AS ENUM (
    'SCHEDULED',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
    'RESCHEDULED'
);


ALTER TYPE public."AuditBookingStatus" OWNER TO gstarr;

--
-- Name: AuditType; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."AuditType" AS ENUM (
    'GENERAL',
    'SALES_PROCESS',
    'MARKETING_FUNNEL',
    'PRICING_STRATEGY',
    'CUSTOMER_RETENTION',
    'DIGITAL_TRANSFORMATION',
    'OPERATIONAL_EFFICIENCY'
);


ALTER TYPE public."AuditType" OWNER TO gstarr;

--
-- Name: BillingModel; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."BillingModel" AS ENUM (
    'TIME_AND_MATERIALS',
    'FIXED_FEE',
    'RETAINER'
);


ALTER TYPE public."BillingModel" OWNER TO gstarr;

--
-- Name: BookingStatus; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."BookingStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
    'RESCHEDULED'
);


ALTER TYPE public."BookingStatus" OWNER TO gstarr;

--
-- Name: CalendarProvider; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."CalendarProvider" AS ENUM (
    'GOOGLE',
    'OUTLOOK',
    'APPLE',
    'ZOOM',
    'CALENDLY'
);


ALTER TYPE public."CalendarProvider" OWNER TO gstarr;

--
-- Name: CampaignStatus; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."CampaignStatus" AS ENUM (
    'DRAFT',
    'SCHEDULED',
    'SENDING',
    'SENT',
    'PAUSED',
    'CANCELLED'
);


ALTER TYPE public."CampaignStatus" OWNER TO gstarr;

--
-- Name: ConsultationType; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."ConsultationType" AS ENUM (
    'STRATEGY',
    'TECHNICAL',
    'IMPLEMENTATION',
    'OPTIMIZATION',
    'TRAINING',
    'GENERAL'
);


ALTER TYPE public."ConsultationType" OWNER TO gstarr;

--
-- Name: ContactStatus; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."ContactStatus" AS ENUM (
    'PENDING',
    'REVIEWED',
    'RESPONDED',
    'CLOSED',
    'EMAIL_FAILED'
);


ALTER TYPE public."ContactStatus" OWNER TO gstarr;

--
-- Name: DeliveryMethod; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."DeliveryMethod" AS ENUM (
    'DIGITAL',
    'CONSULTATION',
    'DEVELOPMENT',
    'DESIGN',
    'MAINTENANCE',
    'TRAINING'
);


ALTER TYPE public."DeliveryMethod" OWNER TO gstarr;

--
-- Name: DurationType; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."DurationType" AS ENUM (
    'ONE_TIME',
    'HOURLY',
    'DAILY',
    'WEEKLY',
    'MONTHLY',
    'YEARLY',
    'PROJECT_BASED'
);


ALTER TYPE public."DurationType" OWNER TO gstarr;

--
-- Name: EmailFrequency; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."EmailFrequency" AS ENUM (
    'DAILY',
    'WEEKLY',
    'MONTHLY',
    'QUARTERLY'
);


ALTER TYPE public."EmailFrequency" OWNER TO gstarr;

--
-- Name: EmailStatus; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."EmailStatus" AS ENUM (
    'PENDING',
    'SENT',
    'DELIVERED',
    'OPENED',
    'CLICKED',
    'BOUNCED',
    'COMPLAINED',
    'FAILED'
);


ALTER TYPE public."EmailStatus" OWNER TO gstarr;

--
-- Name: EngagementStatus; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."EngagementStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'PAUSED',
    'CLOSED'
);


ALTER TYPE public."EngagementStatus" OWNER TO gstarr;

--
-- Name: FollowUpStatus; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."FollowUpStatus" AS ENUM (
    'PENDING',
    'SENT',
    'COMPLETED',
    'FAILED',
    'CANCELLED'
);


ALTER TYPE public."FollowUpStatus" OWNER TO gstarr;

--
-- Name: FollowUpType; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."FollowUpType" AS ENUM (
    'EMAIL_REMINDER',
    'EMAIL_THANK_YOU',
    'EMAIL_FOLLOW_UP',
    'EMAIL_PROPOSAL',
    'INTERNAL_REMINDER',
    'CALENDAR_EVENT'
);


ALTER TYPE public."FollowUpType" OWNER TO gstarr;

--
-- Name: FulfillmentStatus; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."FulfillmentStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
);


ALTER TYPE public."FulfillmentStatus" OWNER TO gstarr;

--
-- Name: ItemFulfillmentStatus; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."ItemFulfillmentStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'FULFILLED',
    'CANCELLED'
);


ALTER TYPE public."ItemFulfillmentStatus" OWNER TO gstarr;

--
-- Name: ItemStatus; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."ItemStatus" AS ENUM (
    'AVAILABLE',
    'SOLD_OUT',
    'COMING_SOON'
);


ALTER TYPE public."ItemStatus" OWNER TO gstarr;

--
-- Name: ItemType; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."ItemType" AS ENUM (
    'PRODUCT',
    'SERVICE'
);


ALTER TYPE public."ItemType" OWNER TO gstarr;

--
-- Name: MeetingType; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."MeetingType" AS ENUM (
    'VIDEO_CALL',
    'PHONE_CALL',
    'IN_PERSON',
    'HYBRID'
);


ALTER TYPE public."MeetingType" OWNER TO gstarr;

--
-- Name: MilestoneStatus; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."MilestoneStatus" AS ENUM (
    'PLANNED',
    'IN_PROGRESS',
    'COMPLETE',
    'INVOICED'
);


ALTER TYPE public."MilestoneStatus" OWNER TO gstarr;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."NotificationType" AS ENUM (
    'CONFIRMATION',
    'REMINDER_24H',
    'REMINDER_2H',
    'FOLLOW_UP',
    'CANCELLATION',
    'RESCHEDULE'
);


ALTER TYPE public."NotificationType" OWNER TO gstarr;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'CONFIRMED',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED'
);


ALTER TYPE public."OrderStatus" OWNER TO gstarr;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'PAYPAL',
    'STRIPE',
    'BANK_TRANSFER',
    'OTHER'
);


ALTER TYPE public."PaymentMethod" OWNER TO gstarr;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
    'REFUNDED',
    'PARTIALLY_REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO gstarr;

--
-- Name: PostStatus; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."PostStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);


ALTER TYPE public."PostStatus" OWNER TO gstarr;

--
-- Name: SubscriptionStatus; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'PENDING',
    'ACTIVE',
    'UNSUBSCRIBED',
    'BOUNCED',
    'COMPLAINED'
);


ALTER TYPE public."SubscriptionStatus" OWNER TO gstarr;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: gstarr
--

CREATE TYPE public."UserRole" AS ENUM (
    'USER',
    'AUTHOR',
    'EDITOR',
    'ADMIN',
    'PM'
);


ALTER TYPE public."UserRole" OWNER TO gstarr;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AccessRequest; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public."AccessRequest" (
    id text NOT NULL,
    "engagementId" text NOT NULL,
    type public."AccessType" NOT NULL,
    details character varying(500),
    "requestedFor" character varying(100),
    status public."AccessStatus" DEFAULT 'PENDING'::public."AccessStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AccessRequest" OWNER TO gstarr;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "actorUserId" text,
    action character varying(50) NOT NULL,
    "entityType" character varying(50) NOT NULL,
    "entityId" text NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO gstarr;

--
-- Name: ClientCall; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public."ClientCall" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "userEmail" text NOT NULL,
    "scheduledAt" timestamp(3) without time zone NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    phone text
);


ALTER TABLE public."ClientCall" OWNER TO gstarr;

--
-- Name: Company; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public."Company" (
    id text NOT NULL,
    name character varying(100) NOT NULL,
    website character varying(255),
    industry character varying(50),
    size character varying(20),
    "billingEmail" character varying(255),
    "billingAddress" character varying(500),
    notes character varying(1000),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Company" OWNER TO gstarr;

--
-- Name: Contact; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public."Contact" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "firstName" character varying(50) NOT NULL,
    "lastName" character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    role character varying(50),
    "isPrimary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Contact" OWNER TO gstarr;

--
-- Name: Engagement; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public."Engagement" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    name character varying(100) NOT NULL,
    status public."EngagementStatus" DEFAULT 'DRAFT'::public."EngagementStatus" NOT NULL,
    "startDate" timestamp(3) without time zone,
    "targetEndDate" timestamp(3) without time zone,
    "budgetCurrency" character varying(3),
    "budgetAmount" numeric(12,2),
    "billingModel" public."BillingModel" NOT NULL,
    "scopeSummary" character varying(2000),
    "acceptanceCriteria" character varying(2000),
    "repoStrategy" character varying(1000),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Engagement" OWNER TO gstarr;

--
-- Name: EngagementStakeholder; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public."EngagementStakeholder" (
    id text NOT NULL,
    "engagementId" text NOT NULL,
    "contactId" text NOT NULL,
    role character varying(50),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."EngagementStakeholder" OWNER TO gstarr;

--
-- Name: Environment; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public."Environment" (
    id text NOT NULL,
    "engagementId" text NOT NULL,
    name character varying(50) NOT NULL,
    url character varying(255),
    notes character varying(500),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Environment" OWNER TO gstarr;

--
-- Name: Milestone; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public."Milestone" (
    id text NOT NULL,
    "engagementId" text NOT NULL,
    title character varying(100) NOT NULL,
    description character varying(500),
    "dueDate" timestamp(3) without time zone,
    amount numeric(12,2),
    status public."MilestoneStatus" DEFAULT 'PLANNED'::public."MilestoneStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Milestone" OWNER TO gstarr;

--
-- Name: _MarketplaceItemToTag; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public."_MarketplaceItemToTag" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_MarketplaceItemToTag" OWNER TO gstarr;

--
-- Name: _PostToTag; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public."_PostToTag" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_PostToTag" OWNER TO gstarr;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO gstarr;

--
-- Name: ai_optimization_reports; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.ai_optimization_reports (
    id text NOT NULL,
    email text NOT NULL,
    company text,
    industry text,
    "businessSize" text,
    "currentTools" text[] DEFAULT ARRAY[]::text[],
    "painPoints" text[] DEFAULT ARRAY[]::text[],
    "reportSent" boolean DEFAULT false NOT NULL,
    "reportData" jsonb,
    "sentAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.ai_optimization_reports OWNER TO gstarr;

--
-- Name: audit_availability; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.audit_availability (
    id text NOT NULL,
    "dayOfWeek" integer NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    timezone text DEFAULT 'America/New_York'::text NOT NULL,
    "isAvailable" boolean DEFAULT true NOT NULL,
    "maxBookings" integer DEFAULT 1 NOT NULL,
    "bufferMinutes" integer DEFAULT 15 NOT NULL,
    "effectiveFrom" timestamp(3) without time zone,
    "effectiveTo" timestamp(3) without time zone,
    "assignedToId" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.audit_availability OWNER TO gstarr;

--
-- Name: audit_blocked_dates; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.audit_blocked_dates (
    id text NOT NULL,
    "blockedDate" timestamp(3) without time zone NOT NULL,
    "startTime" text,
    "endTime" text,
    timezone text DEFAULT 'America/New_York'::text NOT NULL,
    reason text NOT NULL,
    notes text,
    "assignedToId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.audit_blocked_dates OWNER TO gstarr;

--
-- Name: audit_bookings; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.audit_bookings (
    id text NOT NULL,
    "scheduledDate" timestamp(3) without time zone NOT NULL,
    "scheduledTime" text NOT NULL,
    duration integer DEFAULT 60 NOT NULL,
    timezone text DEFAULT 'America/New_York'::text NOT NULL,
    "clientName" text NOT NULL,
    "clientEmail" text NOT NULL,
    "clientPhone" text,
    "companyName" text,
    "companySize" text,
    industry text,
    "auditType" public."AuditType" DEFAULT 'GENERAL'::public."AuditType" NOT NULL,
    "currentRevenue" text,
    "painPoints" text[],
    goals text[],
    "additionalNotes" text,
    "confirmationSent" boolean DEFAULT false NOT NULL,
    "reminderSent" boolean DEFAULT false NOT NULL,
    "meetingLink" text,
    "calendarEventId" text,
    "adminNotes" text,
    "preparationNotes" text,
    "followUpActions" text[],
    "assignedToId" text,
    "userId" text,
    "auditCompleted" boolean DEFAULT false NOT NULL,
    "auditResults" jsonb,
    "recommendedActions" text[],
    "followUpScheduled" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    status public."AuditBookingStatus" DEFAULT 'SCHEDULED'::public."AuditBookingStatus" NOT NULL
);


ALTER TABLE public.audit_bookings OWNER TO gstarr;

--
-- Name: audit_notifications; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.audit_notifications (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    type public."NotificationType" NOT NULL,
    "scheduledFor" timestamp(3) without time zone NOT NULL,
    sent boolean DEFAULT false NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "recipientEmail" text NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    "lastAttempt" timestamp(3) without time zone,
    "errorMessage" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.audit_notifications OWNER TO gstarr;

--
-- Name: audit_templates; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.audit_templates (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "auditType" public."AuditType" NOT NULL,
    sections jsonb NOT NULL,
    questions jsonb NOT NULL,
    checklists jsonb NOT NULL,
    "estimatedDuration" integer DEFAULT 60 NOT NULL,
    "followUpRequired" boolean DEFAULT true NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.audit_templates OWNER TO gstarr;

--
-- Name: calendar_integrations; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.calendar_integrations (
    id text NOT NULL,
    "userId" text NOT NULL,
    provider public."CalendarProvider" NOT NULL,
    "providerAccountId" text NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "tokenExpiresAt" timestamp(3) without time zone,
    "defaultCalendarId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.calendar_integrations OWNER TO gstarr;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO gstarr;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.comments (
    id text NOT NULL,
    content text NOT NULL,
    "postId" text NOT NULL,
    "authorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.comments OWNER TO gstarr;

--
-- Name: consultations; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.consultations (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "consultationType" public."ConsultationType" NOT NULL,
    status public."BookingStatus" DEFAULT 'PENDING'::public."BookingStatus" NOT NULL,
    "scheduledAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    duration integer DEFAULT 30 NOT NULL,
    "timeZone" text DEFAULT 'UTC'::text NOT NULL,
    "clientName" text NOT NULL,
    "clientEmail" text NOT NULL,
    "clientPhone" text,
    company text,
    "teamSize" integer,
    industry text,
    "meetingType" public."MeetingType" DEFAULT 'VIDEO_CALL'::public."MeetingType" NOT NULL,
    "meetingUrl" text,
    "meetingId" text,
    "meetingPassword" text,
    objectives text,
    "currentSituation" text,
    "desiredOutcome" text,
    budget text,
    timeline text,
    "specificQuestions" text,
    "consultationNotes" text,
    "actionItems" jsonb,
    "proposalGenerated" boolean DEFAULT false NOT NULL,
    "proposalUrl" text,
    "internalNotes" text,
    "assignedToId" text,
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.consultations OWNER TO gstarr;

--
-- Name: contact_forms; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.contact_forms (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    company text,
    phone text,
    status public."ContactStatus" DEFAULT 'PENDING'::public."ContactStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.contact_forms OWNER TO gstarr;

--
-- Name: follow_ups; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.follow_ups (
    id text NOT NULL,
    type public."FollowUpType" NOT NULL,
    status public."FollowUpStatus" DEFAULT 'PENDING'::public."FollowUpStatus" NOT NULL,
    "scheduledAt" timestamp(3) without time zone NOT NULL,
    "completedAt" timestamp(3) without time zone,
    subject text NOT NULL,
    message text NOT NULL,
    "emailSent" boolean DEFAULT false NOT NULL,
    "emailSentAt" timestamp(3) without time zone,
    "revenueAuditId" text,
    "consultationId" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.follow_ups OWNER TO gstarr;

--
-- Name: likes; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.likes (
    id text NOT NULL,
    "postId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.likes OWNER TO gstarr;

--
-- Name: marketplace_items; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.marketplace_items (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    price numeric(10,2) NOT NULL,
    "imageUrl" text NOT NULL,
    status public."ItemStatus" DEFAULT 'AVAILABLE'::public."ItemStatus" NOT NULL,
    "categoryId" text NOT NULL,
    "sellerId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    specifications jsonb,
    features text[],
    stock integer DEFAULT 0 NOT NULL,
    weight numeric(10,2),
    dimensions jsonb,
    featured boolean DEFAULT false NOT NULL,
    published boolean DEFAULT true NOT NULL,
    "sortOrder" integer,
    compatibility text[],
    complexity_level text,
    consultation_required boolean DEFAULT false NOT NULL,
    custom_pricing boolean DEFAULT false NOT NULL,
    deliverables text[],
    delivery_method public."DeliveryMethod",
    demo_url text,
    digital_download_url text,
    discount_price numeric(10,2),
    documentation_url text,
    duration_type public."DurationType",
    duration_unit text,
    estimated_duration integer,
    faq jsonb,
    gallery_images text[],
    industry_focus text[],
    is_recurring boolean DEFAULT false NOT NULL,
    item_type public."ItemType" DEFAULT 'SERVICE'::public."ItemType" NOT NULL,
    license_type text,
    max_order_quantity integer,
    min_order_quantity integer DEFAULT 1,
    prerequisites text[],
    price_range_max numeric(10,2),
    price_range_min numeric(10,2),
    rating_average numeric(3,2) DEFAULT 0.00,
    rating_count integer DEFAULT 0 NOT NULL,
    recurring_interval text,
    revision_limit integer,
    service_excludes text[],
    service_includes text[],
    setup_fee numeric(10,2),
    support_duration integer,
    support_duration_unit text,
    system_requirements jsonb,
    target_audience text[],
    technology_stack text[],
    testimonials jsonb,
    video_url text,
    "paypalProductId" text
);


ALTER TABLE public.marketplace_items OWNER TO gstarr;

--
-- Name: newsletter_campaigns; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.newsletter_campaigns (
    id text NOT NULL,
    name text NOT NULL,
    subject text NOT NULL,
    preheader text,
    content text NOT NULL,
    "htmlContent" text NOT NULL,
    status public."CampaignStatus" DEFAULT 'DRAFT'::public."CampaignStatus" NOT NULL,
    "scheduledAt" timestamp(3) without time zone,
    "sentAt" timestamp(3) without time zone,
    "segmentCriteria" jsonb,
    "templateId" text,
    "totalRecipients" integer DEFAULT 0 NOT NULL,
    "totalSent" integer DEFAULT 0 NOT NULL,
    "totalDelivered" integer DEFAULT 0 NOT NULL,
    "totalOpened" integer DEFAULT 0 NOT NULL,
    "totalClicked" integer DEFAULT 0 NOT NULL,
    "totalUnsubscribed" integer DEFAULT 0 NOT NULL,
    "totalBounced" integer DEFAULT 0 NOT NULL,
    "totalComplained" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.newsletter_campaigns OWNER TO gstarr;

--
-- Name: newsletter_emails; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.newsletter_emails (
    id text NOT NULL,
    "campaignId" text NOT NULL,
    "subscriberId" text NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    "htmlContent" text NOT NULL,
    status public."EmailStatus" DEFAULT 'PENDING'::public."EmailStatus" NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "openedAt" timestamp(3) without time zone,
    "clickedAt" timestamp(3) without time zone,
    "bouncedAt" timestamp(3) without time zone,
    "complainedAt" timestamp(3) without time zone,
    "openCount" integer DEFAULT 0 NOT NULL,
    "clickCount" integer DEFAULT 0 NOT NULL,
    "errorMessage" text,
    "retryCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.newsletter_emails OWNER TO gstarr;

--
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.newsletter_subscribers (
    id text NOT NULL,
    email text NOT NULL,
    "firstName" text,
    "lastName" text,
    status public."SubscriptionStatus" DEFAULT 'PENDING'::public."SubscriptionStatus" NOT NULL,
    "consentGiven" boolean DEFAULT false NOT NULL,
    "consentDate" timestamp(3) without time zone,
    "ipAddress" text,
    "userAgent" text,
    source text,
    "confirmationToken" text,
    "confirmedAt" timestamp(3) without time zone,
    "lastEmailSent" timestamp(3) without time zone,
    "lastOpenedEmail" timestamp(3) without time zone,
    "lastClickedEmail" timestamp(3) without time zone,
    "totalEmailsSent" integer DEFAULT 0 NOT NULL,
    "totalEmailsOpened" integer DEFAULT 0 NOT NULL,
    "totalEmailsClicked" integer DEFAULT 0 NOT NULL,
    "unsubscribeToken" text,
    "unsubscribeReason" text,
    "unsubscribedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.newsletter_subscribers OWNER TO gstarr;

--
-- Name: newsletter_templates; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.newsletter_templates (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    content text NOT NULL,
    "htmlContent" text NOT NULL,
    variables jsonb,
    "isDefault" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.newsletter_templates OWNER TO gstarr;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "marketplaceItemId" text,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    "itemType" public."ItemType",
    "digitalDownloadUrl" text,
    "licenseKey" text,
    customizations jsonb,
    "fulfillmentStatus" public."ItemFulfillmentStatus" DEFAULT 'PENDING'::public."ItemFulfillmentStatus" NOT NULL
);


ALTER TABLE public.order_items OWNER TO gstarr;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.orders (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    total numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    "taxAmount" numeric(10,2),
    "shippingAmount" numeric(10,2),
    "discountAmount" numeric(10,2),
    currency text DEFAULT 'USD'::text NOT NULL,
    "customerEmail" text NOT NULL,
    "customerName" text,
    "billingAddress" jsonb,
    "shippingAddress" jsonb,
    "paymentMethod" public."PaymentMethod" NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "paymentId" text,
    "paymentData" jsonb,
    "userId" text,
    "fulfillmentStatus" public."FulfillmentStatus" DEFAULT 'PENDING'::public."FulfillmentStatus" NOT NULL,
    "shippedAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "trackingNumber" text,
    notes text,
    "internalNotes" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.orders OWNER TO gstarr;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.password_reset_tokens (
    id text NOT NULL,
    token text NOT NULL,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO gstarr;

--
-- Name: posts; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.posts (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text NOT NULL,
    excerpt text,
    "featuredImage" text,
    status public."PostStatus" DEFAULT 'DRAFT'::public."PostStatus" NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "authorId" text NOT NULL,
    "categoryId" text NOT NULL,
    "metaTitle" text,
    "metaDescription" text,
    keywords text[],
    "viewCount" integer DEFAULT 0 NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    pinned boolean DEFAULT false NOT NULL,
    "sortOrder" integer,
    locale text DEFAULT 'en'::text NOT NULL
);


ALTER TABLE public.posts OWNER TO gstarr;

--
-- Name: revenue_audits; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.revenue_audits (
    id text NOT NULL,
    title text DEFAULT 'Revenue Operations Audit'::text NOT NULL,
    description text,
    status public."BookingStatus" DEFAULT 'PENDING'::public."BookingStatus" NOT NULL,
    "scheduledAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    duration integer DEFAULT 60 NOT NULL,
    "timeZone" text DEFAULT 'UTC'::text NOT NULL,
    "clientName" text NOT NULL,
    "clientEmail" text NOT NULL,
    "clientPhone" text,
    company text,
    "teamSize" integer,
    industry text,
    "currentChallenges" text,
    "specificAreas" text[],
    "meetingType" public."MeetingType" DEFAULT 'VIDEO_CALL'::public."MeetingType" NOT NULL,
    "meetingUrl" text,
    "meetingId" text,
    "meetingPassword" text,
    "revenueGoals" text,
    "currentSystems" text[],
    "painPoints" text,
    "expectedOutcomes" text,
    "auditResults" text,
    recommendations jsonb,
    "followUpScheduled" boolean DEFAULT false NOT NULL,
    "nextSteps" text,
    "internalNotes" text,
    "assignedToId" text,
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.revenue_audits OWNER TO gstarr;

--
-- Name: subscriber_preferences; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.subscriber_preferences (
    id text NOT NULL,
    "subscriberId" text NOT NULL,
    "blogUpdates" boolean DEFAULT true NOT NULL,
    "productUpdates" boolean DEFAULT true NOT NULL,
    "marketplaceUpdates" boolean DEFAULT true NOT NULL,
    "eventNotifications" boolean DEFAULT false NOT NULL,
    "specialOffers" boolean DEFAULT false NOT NULL,
    frequency public."EmailFrequency" DEFAULT 'WEEKLY'::public."EmailFrequency" NOT NULL,
    "categoryInterests" text[] DEFAULT ARRAY[]::text[],
    "tagInterests" text[] DEFAULT ARRAY[]::text[],
    "preferredTime" text,
    timezone text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.subscriber_preferences OWNER TO gstarr;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.tags (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tags OWNER TO gstarr;

--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.testimonials (
    id text NOT NULL,
    content text NOT NULL,
    rating integer DEFAULT 5 NOT NULL,
    "authorId" text NOT NULL,
    role text,
    company text,
    avatar text,
    featured boolean DEFAULT false NOT NULL,
    published boolean DEFAULT true NOT NULL,
    "sortOrder" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.testimonials OWNER TO gstarr;

--
-- Name: users; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    password text NOT NULL,
    avatar text,
    bio text,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "additionalInfo" text,
    budget text,
    "businessGoals" text,
    company text,
    "interestArea" text,
    "onboardingCompleted" boolean DEFAULT false NOT NULL,
    "teamSize" text,
    timeline text
);


ALTER TABLE public.users OWNER TO gstarr;

--
-- Name: wishlists; Type: TABLE; Schema: public; Owner: gstarr
--

CREATE TABLE public.wishlists (
    id text NOT NULL,
    "userId" text NOT NULL,
    "itemId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.wishlists OWNER TO gstarr;

--
-- Data for Name: AccessRequest; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public."AccessRequest" (id, "engagementId", type, details, "requestedFor", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public."AuditLog" (id, "actorUserId", action, "entityType", "entityId", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: ClientCall; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public."ClientCall" (id, "userId", "userEmail", "scheduledAt", notes, "createdAt", "updatedAt", phone) FROM stdin;
\.


--
-- Data for Name: Company; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public."Company" (id, name, website, industry, size, "billingEmail", "billingAddress", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Contact; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public."Contact" (id, "companyId", "firstName", "lastName", email, phone, role, "isPrimary", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Engagement; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public."Engagement" (id, "companyId", name, status, "startDate", "targetEndDate", "budgetCurrency", "budgetAmount", "billingModel", "scopeSummary", "acceptanceCriteria", "repoStrategy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: EngagementStakeholder; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public."EngagementStakeholder" (id, "engagementId", "contactId", role, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Environment; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public."Environment" (id, "engagementId", name, url, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Milestone; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public."Milestone" (id, "engagementId", title, description, "dueDate", amount, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _MarketplaceItemToTag; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public."_MarketplaceItemToTag" ("A", "B") FROM stdin;
287cb4e4-ed26-407e-b73a-ef248c243c13	5d107f8e-39d2-4470-95a7-0fdefb4f1024
287cb4e4-ed26-407e-b73a-ef248c243c13	627928e9-d71a-45e5-a589-c5c858bff57f
287cb4e4-ed26-407e-b73a-ef248c243c13	4268e580-cd64-4290-bd8c-e49beffa1590
e08bb870-c69e-4c5e-8a8a-a27f2f49b115	5d107f8e-39d2-4470-95a7-0fdefb4f1024
e08bb870-c69e-4c5e-8a8a-a27f2f49b115	627928e9-d71a-45e5-a589-c5c858bff57f
e08bb870-c69e-4c5e-8a8a-a27f2f49b115	0b5d74c7-83a7-488c-b1e0-9f8c7c1214ae
e08bb870-c69e-4c5e-8a8a-a27f2f49b115	a885de4d-7cef-4025-af3c-3cd70402857f
3cce24cd-d9ca-46f6-9e0a-2c731f01d329	23526607-a28c-4e81-b7c2-cc9d78a2441b
3cce24cd-d9ca-46f6-9e0a-2c731f01d329	ef2744b8-ead3-4222-93c1-97e8597680cc
3cce24cd-d9ca-46f6-9e0a-2c731f01d329	aea103c3-92b6-422a-8e44-822ea3a62816
a9e53fc2-0813-4b88-b668-15cdad702f02	e73d0828-94e0-4b7e-886f-7dfae65b0719
fb001cd2-d715-42b9-85ce-4a97aa7f4d59	a3617e5b-aeb1-4166-a179-5e67981ae32b
305657c2-a918-41d8-ae69-59971dc47f71	094f83b6-19f2-4be3-a724-de019ecd3842
3429784e-dec4-479a-80df-33560b21f439	214d3542-9513-4a23-aadb-33aba00e5226
22a1a202-309a-4f86-a0ce-90a165934631	214d3542-9513-4a23-aadb-33aba00e5226
51e5cfbe-0bb0-4857-a9d3-6388cd259263	fbfedb60-054d-4c85-8fdf-4c61c6969335
4d6c8c13-1ce4-473b-911c-4ec1d7d123a8	fbfedb60-054d-4c85-8fdf-4c61c6969335
4d6c8c13-1ce4-473b-911c-4ec1d7d123a8	214d3542-9513-4a23-aadb-33aba00e5226
ed1175b6-326d-4816-b997-a730038861d1	fbfedb60-054d-4c85-8fdf-4c61c6969335
ed1175b6-326d-4816-b997-a730038861d1	cf1c19e5-9667-4d8d-994c-c2501f86428c
ed1175b6-326d-4816-b997-a730038861d1	1dbc2dfc-a6ea-4396-99a5-e0979bd741e0
659df615-d5f1-4017-8352-a4e8a5dd8d24	fbfedb60-054d-4c85-8fdf-4c61c6969335
659df615-d5f1-4017-8352-a4e8a5dd8d24	6c6dd069-5284-4f00-ac37-06530d1346ff
659df615-d5f1-4017-8352-a4e8a5dd8d24	a5a5ad73-5096-4230-bacc-3a1266cfc03b
5ef8405b-091b-4336-a87b-0e7d0674dccd	aea103c3-92b6-422a-8e44-822ea3a62816
5ef8405b-091b-4336-a87b-0e7d0674dccd	fbfedb60-054d-4c85-8fdf-4c61c6969335
5ef8405b-091b-4336-a87b-0e7d0674dccd	6c6dd069-5284-4f00-ac37-06530d1346ff
5ef8405b-091b-4336-a87b-0e7d0674dccd	3becfff0-9bbf-4084-8628-e8777089399b
86387e1b-10b4-423d-96e3-8f430f827db9	aea103c3-92b6-422a-8e44-822ea3a62816
86387e1b-10b4-423d-96e3-8f430f827db9	fbfedb60-054d-4c85-8fdf-4c61c6969335
86387e1b-10b4-423d-96e3-8f430f827db9	9e938af1-f648-4dcf-b6a4-1139886dc400
86387e1b-10b4-423d-96e3-8f430f827db9	cf1c19e5-9667-4d8d-994c-c2501f86428c
86387e1b-10b4-423d-96e3-8f430f827db9	1dbc2dfc-a6ea-4396-99a5-e0979bd741e0
80c4ee51-3dcb-4445-91a1-aaa7480e7a3e	fbfedb60-054d-4c85-8fdf-4c61c6969335
80c4ee51-3dcb-4445-91a1-aaa7480e7a3e	ed60e29d-e9ba-4f1e-ac62-28cfba8d3e3a
80c4ee51-3dcb-4445-91a1-aaa7480e7a3e	ec169a32-02a4-4734-8f24-c0b38dcbbbe9
32325646-37c6-4f9b-986d-8ea557695f03	fbfedb60-054d-4c85-8fdf-4c61c6969335
32325646-37c6-4f9b-986d-8ea557695f03	214d3542-9513-4a23-aadb-33aba00e5226
32325646-37c6-4f9b-986d-8ea557695f03	cbfb6632-476b-4b3e-85a8-7907b38aa49f
32325646-37c6-4f9b-986d-8ea557695f03	1dbc2dfc-a6ea-4396-99a5-e0979bd741e0
8cc424be-39e4-4385-b10c-78d18debcebc	e590b92d-f68b-4326-9ef7-61394daddc89
8cc424be-39e4-4385-b10c-78d18debcebc	f84e49ef-f372-4473-824e-9ecf603f386d
8cc424be-39e4-4385-b10c-78d18debcebc	94398e14-ea79-4e04-9fea-25c71dc0c38c
8cc424be-39e4-4385-b10c-78d18debcebc	f1a96cff-e55b-4187-9af9-b9bf2dc63780
c70c3672-284d-42f5-906f-c941d7445795	b452af63-9581-4dd6-b080-ca7398bfe439
c70c3672-284d-42f5-906f-c941d7445795	1e62ea2d-ac4e-4b92-81bf-5d1f08f8b79d
c70c3672-284d-42f5-906f-c941d7445795	708cb5e1-c9e4-4969-95b8-a8df9e6746fc
c70c3672-284d-42f5-906f-c941d7445795	04227390-80f8-41cb-aef0-7d9f67f79d93
3af36829-01c0-4f2e-8d00-c2567238dfbf	708cb5e1-c9e4-4969-95b8-a8df9e6746fc
3af36829-01c0-4f2e-8d00-c2567238dfbf	912aecb2-2b66-4c69-a89c-c829c872faa4
3af36829-01c0-4f2e-8d00-c2567238dfbf	dbaa4fe5-aba8-46e1-876e-40923446cba0
bae6adc3-5ea6-4df8-92e5-e0b36044a10e	0b446e68-284e-4330-9f48-f7f6de3b481d
7df93433-8831-41bd-9b7e-9e6e18b11a91	fbfedb60-054d-4c85-8fdf-4c61c6969335
7df93433-8831-41bd-9b7e-9e6e18b11a91	9e938af1-f648-4dcf-b6a4-1139886dc400
7df93433-8831-41bd-9b7e-9e6e18b11a91	f5a97c10-1950-47c7-bb6b-012c0be2a74f
7df93433-8831-41bd-9b7e-9e6e18b11a91	efb3db91-af3d-42e5-94a0-04186a3a276c
d30fef11-ba0f-4247-86d8-bd539162bfa3	fbfedb60-054d-4c85-8fdf-4c61c6969335
d30fef11-ba0f-4247-86d8-bd539162bfa3	f5a97c10-1950-47c7-bb6b-012c0be2a74f
d30fef11-ba0f-4247-86d8-bd539162bfa3	214d3542-9513-4a23-aadb-33aba00e5226
d30fef11-ba0f-4247-86d8-bd539162bfa3	efb3db91-af3d-42e5-94a0-04186a3a276c
50929f16-0164-4556-9d6c-416608a92a4d	fbfedb60-054d-4c85-8fdf-4c61c6969335
50929f16-0164-4556-9d6c-416608a92a4d	f5a97c10-1950-47c7-bb6b-012c0be2a74f
50929f16-0164-4556-9d6c-416608a92a4d	214d3542-9513-4a23-aadb-33aba00e5226
50929f16-0164-4556-9d6c-416608a92a4d	efb3db91-af3d-42e5-94a0-04186a3a276c
1b5077c4-6218-4970-8933-688ef8000cdd	fbfedb60-054d-4c85-8fdf-4c61c6969335
1b5077c4-6218-4970-8933-688ef8000cdd	01a9dcae-1198-4b27-bd03-414cac00e273
1b5077c4-6218-4970-8933-688ef8000cdd	2b080171-27cc-4094-8c0e-ebf4153a3dc0
1b5077c4-6218-4970-8933-688ef8000cdd	094f83b6-19f2-4be3-a724-de019ecd3842
01dd7d80-c83f-4e4c-90ec-df5a5154d6de	01a9dcae-1198-4b27-bd03-414cac00e273
01dd7d80-c83f-4e4c-90ec-df5a5154d6de	214d3542-9513-4a23-aadb-33aba00e5226
01dd7d80-c83f-4e4c-90ec-df5a5154d6de	35f9000d-bc9c-41ee-8920-4600b9ed7dee
01dd7d80-c83f-4e4c-90ec-df5a5154d6de	0441e63e-af2e-4f80-8fab-34b7fddeb8c5
89f615ba-07c8-4c97-b343-f79eade0944f	01a9dcae-1198-4b27-bd03-414cac00e273
89f615ba-07c8-4c97-b343-f79eade0944f	efb3db91-af3d-42e5-94a0-04186a3a276c
89f615ba-07c8-4c97-b343-f79eade0944f	e590b92d-f68b-4326-9ef7-61394daddc89
98732d2f-9a26-4684-b2ec-57ed6b7a91a7	55cf6d08-c7d7-4861-a21f-1f41e99d09c8
98732d2f-9a26-4684-b2ec-57ed6b7a91a7	2b080171-27cc-4094-8c0e-ebf4153a3dc0
98732d2f-9a26-4684-b2ec-57ed6b7a91a7	ac8a2edd-a7f0-4ac1-9e98-83ec9c9af745
98732d2f-9a26-4684-b2ec-57ed6b7a91a7	0441e63e-af2e-4f80-8fab-34b7fddeb8c5
6e57fe76-1d20-4d7b-8b11-6b654e6775b4	55cf6d08-c7d7-4861-a21f-1f41e99d09c8
6e57fe76-1d20-4d7b-8b11-6b654e6775b4	214d3542-9513-4a23-aadb-33aba00e5226
6e57fe76-1d20-4d7b-8b11-6b654e6775b4	0441e63e-af2e-4f80-8fab-34b7fddeb8c5
6e57fe76-1d20-4d7b-8b11-6b654e6775b4	8bb5ada5-7e88-4f9b-8665-5cbe0c750445
9ee2d7f2-241c-452b-9000-104ef095bd98	55cf6d08-c7d7-4861-a21f-1f41e99d09c8
9ee2d7f2-241c-452b-9000-104ef095bd98	e590b92d-f68b-4326-9ef7-61394daddc89
8705a1cc-2daa-4fc4-a87a-97c95626afeb	fbfedb60-054d-4c85-8fdf-4c61c6969335
8705a1cc-2daa-4fc4-a87a-97c95626afeb	d9a94873-e6ce-4ce0-882b-5cf25cc7e091
8705a1cc-2daa-4fc4-a87a-97c95626afeb	094f83b6-19f2-4be3-a724-de019ecd3842
8705a1cc-2daa-4fc4-a87a-97c95626afeb	35f9000d-bc9c-41ee-8920-4600b9ed7dee
ab7d1f92-1b9d-4a29-baac-c9945f2afd3d	d9a94873-e6ce-4ce0-882b-5cf25cc7e091
ab7d1f92-1b9d-4a29-baac-c9945f2afd3d	214d3542-9513-4a23-aadb-33aba00e5226
ab7d1f92-1b9d-4a29-baac-c9945f2afd3d	8bb5ada5-7e88-4f9b-8665-5cbe0c750445
71014f32-3ced-4b25-be26-16e3d0254977	d9a94873-e6ce-4ce0-882b-5cf25cc7e091
71014f32-3ced-4b25-be26-16e3d0254977	efb3db91-af3d-42e5-94a0-04186a3a276c
71014f32-3ced-4b25-be26-16e3d0254977	e590b92d-f68b-4326-9ef7-61394daddc89
ee5814f2-eed2-41e5-be9c-fa2dbf8540cf	8302a316-0442-4245-81f9-7810f86524d4
ee5814f2-eed2-41e5-be9c-fa2dbf8540cf	094f83b6-19f2-4be3-a724-de019ecd3842
ee5814f2-eed2-41e5-be9c-fa2dbf8540cf	35f9000d-bc9c-41ee-8920-4600b9ed7dee
ee5814f2-eed2-41e5-be9c-fa2dbf8540cf	efb3db91-af3d-42e5-94a0-04186a3a276c
99629e56-37b5-45dc-8dc2-b3dd172d373b	8302a316-0442-4245-81f9-7810f86524d4
99629e56-37b5-45dc-8dc2-b3dd172d373b	214d3542-9513-4a23-aadb-33aba00e5226
63951998-982b-46af-b6b6-626545b125ef	8302a316-0442-4245-81f9-7810f86524d4
63951998-982b-46af-b6b6-626545b125ef	e590b92d-f68b-4326-9ef7-61394daddc89
44070a21-9116-457c-8e3c-0e4e1359282f	825d5dc7-d2be-41a7-add3-d1bf4e3339d0
44070a21-9116-457c-8e3c-0e4e1359282f	35f9000d-bc9c-41ee-8920-4600b9ed7dee
44070a21-9116-457c-8e3c-0e4e1359282f	8bb5ada5-7e88-4f9b-8665-5cbe0c750445
74de7679-ae6f-4d91-a07e-9f5d4c04096a	825d5dc7-d2be-41a7-add3-d1bf4e3339d0
74de7679-ae6f-4d91-a07e-9f5d4c04096a	214d3542-9513-4a23-aadb-33aba00e5226
07a7208b-7e21-4e92-ac5e-78f4e71b54f0	825d5dc7-d2be-41a7-add3-d1bf4e3339d0
07a7208b-7e21-4e92-ac5e-78f4e71b54f0	e590b92d-f68b-4326-9ef7-61394daddc89
8d597bf3-471d-451a-89a3-1ef1ae78b97f	fbfedb60-054d-4c85-8fdf-4c61c6969335
8d597bf3-471d-451a-89a3-1ef1ae78b97f	6c6dd069-5284-4f00-ac37-06530d1346ff
d6336b1f-145a-4129-9c0b-2cdfc052d06b	aea103c3-92b6-422a-8e44-822ea3a62816
d6336b1f-145a-4129-9c0b-2cdfc052d06b	fbfedb60-054d-4c85-8fdf-4c61c6969335
b9b610a1-256c-48f6-8b72-4687c713b3c0	e590b92d-f68b-4326-9ef7-61394daddc89
b2a51567-3028-4e5d-bf7a-80a9ddec4d35	23526607-a28c-4e81-b7c2-cc9d78a2441b
64f02bc0-0e0a-4f7c-98bb-7cb5f6e99bbc	6c6dd069-5284-4f00-ac37-06530d1346ff
64f02bc0-0e0a-4f7c-98bb-7cb5f6e99bbc	a5a5ad73-5096-4230-bacc-3a1266cfc03b
567f6139-585c-4a5d-90ad-089356a8fef1	fbfedb60-054d-4c85-8fdf-4c61c6969335
c34d8bcc-f41f-4a29-8df7-d9f24e4fe688	aea103c3-92b6-422a-8e44-822ea3a62816
9c010512-d0d6-4fc3-a36b-0bdeadff0d15	0b446e68-284e-4330-9f48-f7f6de3b481d
455f311b-3901-4882-9be2-f4091394fb53	fbfedb60-054d-4c85-8fdf-4c61c6969335
f77b0e85-f590-4954-b326-8e6c0d437ea9	fbfedb60-054d-4c85-8fdf-4c61c6969335
\.


--
-- Data for Name: _PostToTag; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public."_PostToTag" ("A", "B") FROM stdin;
4659a7ec-1cdf-4de0-aba6-c787e040d38f	fbfedb60-054d-4c85-8fdf-4c61c6969335
4659a7ec-1cdf-4de0-aba6-c787e040d38f	e744e94e-4cf3-4c7f-a8a2-dd484a6628e0
4659a7ec-1cdf-4de0-aba6-c787e040d38f	9b0ad408-2e2c-488a-95f3-5095f019f7f9
0e8130c7-68f7-4081-baa7-fe1ab58b25d6	5d107f8e-39d2-4470-95a7-0fdefb4f1024
0e8130c7-68f7-4081-baa7-fe1ab58b25d6	0b5d74c7-83a7-488c-b1e0-9f8c7c1214ae
0e8130c7-68f7-4081-baa7-fe1ab58b25d6	07fa69cc-94ed-470f-839a-bba74d3354b1
8af84003-8c25-4302-95b2-b3dace67ec90	521dad05-3487-4bdf-b13b-46753e0fdf3d
8af84003-8c25-4302-95b2-b3dace67ec90	3195c81a-596d-4e15-9713-a46d390662de
8af84003-8c25-4302-95b2-b3dace67ec90	57b4351d-4a60-440e-974d-175bc86f270a
1e55a34b-19da-48bf-8eea-abf9a4c9d188	bec775d8-1099-442e-b586-edfddae4a9bb
1e55a34b-19da-48bf-8eea-abf9a4c9d188	b3de3dfd-e0b8-42f1-a804-f24823828d55
1e55a34b-19da-48bf-8eea-abf9a4c9d188	ca860d9c-5dc3-4773-ae50-ab67e780a0d0
1fcfc6f3-e714-4c23-aaa3-923884a31c5e	5d107f8e-39d2-4470-95a7-0fdefb4f1024
1fcfc6f3-e714-4c23-aaa3-923884a31c5e	cf58ac25-b57c-4107-bad4-7d1b1b7c734f
1fcfc6f3-e714-4c23-aaa3-923884a31c5e	e33abc35-40a0-4cc9-8c71-c57faa2a54f0
849efe72-4095-4cb6-8c3c-ce144b726e2e	fbfedb60-054d-4c85-8fdf-4c61c6969335
849efe72-4095-4cb6-8c3c-ce144b726e2e	b9ff3d04-ed18-476d-b747-38b2f147a6d4
849efe72-4095-4cb6-8c3c-ce144b726e2e	8ed8d052-a249-456a-a4cd-da0926eedc19
e8e27425-6014-4a29-8234-ba851ddc5772	5d107f8e-39d2-4470-95a7-0fdefb4f1024
e8e27425-6014-4a29-8234-ba851ddc5772	a4fbebcd-1db8-4590-a69c-e6ad4ab5e9bd
e8e27425-6014-4a29-8234-ba851ddc5772	10f2b350-2043-4fc5-9a62-0a4e5f0bb80d
cfba200c-6196-4676-bd67-4460626468e6	aa69e627-b927-4ade-ab8f-2ed966ee7150
cfba200c-6196-4676-bd67-4460626468e6	355197cf-6fae-40b9-a960-448ac4456b99
cfba200c-6196-4676-bd67-4460626468e6	d32d241e-0c46-431a-b6ad-f157f59afc49
3f43a601-29c0-4580-b2d6-0656314f6b5f	5d107f8e-39d2-4470-95a7-0fdefb4f1024
3f43a601-29c0-4580-b2d6-0656314f6b5f	61d105ec-2a87-4922-8c9a-14d0753355c0
3f43a601-29c0-4580-b2d6-0656314f6b5f	8b030aef-0bef-4206-b59a-6b18e6515c2d
a918366e-ec63-403a-9cc6-f95f0e525797	8676d7e4-5a74-4742-a934-e7b0f61ceae3
a918366e-ec63-403a-9cc6-f95f0e525797	a716db62-2660-4420-83ce-b2de71d26b33
a918366e-ec63-403a-9cc6-f95f0e525797	7c21ab53-b16a-40ac-aaa5-6efb917dd71b
95f4f3fc-17ad-411d-aea2-b16c85722d67	0715b27d-45d0-469b-b9d2-096f7071f875
95f4f3fc-17ad-411d-aea2-b16c85722d67	fa825b5d-5f9b-457e-9004-3e976f279fa0
95f4f3fc-17ad-411d-aea2-b16c85722d67	4f2d0518-db16-46d7-ace8-1328c4c2a66e
64d58d38-f6fc-43dd-bcfe-ba4bdb9f891e	fbfedb60-054d-4c85-8fdf-4c61c6969335
64d58d38-f6fc-43dd-bcfe-ba4bdb9f891e	55072701-706a-4f8c-961f-0459414b1319
64d58d38-f6fc-43dd-bcfe-ba4bdb9f891e	e997821c-5ac1-4751-9a1b-e02b4e539dee
526f91ce-9aa3-4c1b-a84d-1a9eef9e7bec	fbfedb60-054d-4c85-8fdf-4c61c6969335
526f91ce-9aa3-4c1b-a84d-1a9eef9e7bec	e29a33fb-9765-47d1-974d-8c6f423a41e6
526f91ce-9aa3-4c1b-a84d-1a9eef9e7bec	68934e28-9623-4501-9e97-f618a715386b
7677faba-e752-457c-9d58-809758f68648	7c955471-1420-4fcc-95f7-e275e1244cb4
7677faba-e752-457c-9d58-809758f68648	a9bcdd2d-1b6d-4f28-8fa2-66e69f9ef582
7677faba-e752-457c-9d58-809758f68648	543bdcb5-f3bb-4100-b117-2991fbd5b9a8
d341bc13-5877-4327-8f99-2b079f8b6bdc	23526607-a28c-4e81-b7c2-cc9d78a2441b
d341bc13-5877-4327-8f99-2b079f8b6bdc	8b030aef-0bef-4206-b59a-6b18e6515c2d
d341bc13-5877-4327-8f99-2b079f8b6bdc	84c49a4c-1689-40c2-9378-37db18438534
ce5c9f51-91e5-41e5-a6a5-3514504620b3	33284c37-d2d2-49bd-9758-556bfbd9acf9
ce5c9f51-91e5-41e5-a6a5-3514504620b3	8ed8d052-a249-456a-a4cd-da0926eedc19
ce5c9f51-91e5-41e5-a6a5-3514504620b3	a92a17c4-6d5a-413d-9d1f-dfa30f2c4e81
ce5c9f51-91e5-41e5-a6a5-3514504620b3	e34ba599-7cbc-42fe-be05-da6b6bd38b04
ce5c9f51-91e5-41e5-a6a5-3514504620b3	c5bf8499-4690-4d29-8373-def8042182fe
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
3bd22714-5d7b-4823-9ebc-4b3248008911	c8c361ad319a9f05e63c20904a3f7ec4642f7bcd31765674132b4d178ebb9999	2025-09-11 03:02:02.35476-04	20250224125333_init	\N	\N	2025-09-11 03:02:02.342683-04	1
d747e95d-21c5-47d3-9db0-2e6f6aac8111	122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec	2025-09-11 03:02:02.413782-04	20250911070121_add_ai_optimization_report	\N	\N	2025-09-11 03:02:02.413271-04	1
4408a260-7ee0-4124-bfc9-b722e92a7491	148643356eb09a9e110e3baf5812ce2c72a2d0f555dae40617debe135bea620d	2025-09-11 03:02:02.356799-04	20250226093530_add_testimonials	\N	\N	2025-09-11 03:02:02.354998-04	1
5c7531a3-0c5b-4873-a7e4-1419d3a1698f	820b4eb134c4dc7bc2d9dbd7f8be2c96feaee8eb73a325bd3d53b77baec5ff0e	2025-09-11 03:02:02.358623-04	20250816195133_add_contact_form	\N	\N	2025-09-11 03:02:02.357004-04	1
650f1d18-be12-4820-99eb-35277d633009	e1a2fc07ac75ee595c0582004eddccf16c4c3d71ab4adc66dc245e2230104de6	2025-09-11 03:02:02.366291-04	20250816212955_onboarding_init	\N	\N	2025-09-11 03:02:02.359021-04	1
71de18e2-eeb6-426e-8d74-862ace7c7eff	7dca13c58be80dc33ed9aada915b2a9a158ec6d658713ae1bb0cc115db74e13d	2025-09-11 03:02:23.488815-04	20250911070223_add_audit_scheduling_system	\N	\N	2025-09-11 03:02:23.486336-04	1
6b68fa6f-4220-4c10-910b-7af70d7d76d0	13d39f6385b4fa8e33d16eec6789f094ca61049f1750128a8cd5afd4671fccd3	2025-09-11 03:02:02.380305-04	20250817035109_update_marketplace_for_products_services	\N	\N	2025-09-11 03:02:02.366617-04	1
ac32d174-0c9a-404d-830c-4785371155ae	4eb947fbd331cfd1f9eb785da7b7e3c45021b3b4d1bd804c74ca8ba12c7ba13f	2025-09-11 03:02:02.385019-04	20250817075225_add_order_models	\N	\N	2025-09-11 03:02:02.380546-04	1
88c1e3d0-9488-4566-a9d8-933fc9e82cc7	633b50c32be6f76ab9d883a00de7b3daf75c564b1cf01ed3113c4c7779aae652	2025-09-11 03:02:02.386327-04	20250817182622_add_client_call_model	\N	\N	2025-09-11 03:02:02.38521-04	1
2f8b7552-98d3-4c56-b0dc-4bef55d99809	64877cb99313d5ac63883eb187b529d162e3a2d421e0c5dfd7e872c94e994c56	2025-11-15 17:11:24.543695-05	20251115221115_add_email_failed_status	\N	\N	2025-11-15 17:11:24.540172-05	1
c9ae5ab8-7eb7-44f6-9386-37a1081363d3	9a7efb60503de6ce09d9f38aefbd984795ec71f4027e2ed7acbf8d5730bd41c1	2025-09-11 03:02:02.387122-04	20250817192029_add_phone_to_client_call	\N	\N	2025-09-11 03:02:02.386511-04	1
2f76f902-81c9-44c7-83a2-ffc5a88b7c60	9d9c1156f189321c18600dd9596a264a2287075f9930a2773d1d6726ab4d2a10	2025-09-11 03:02:02.388289-04	20250818142256_add_paypal_product_id	\N	\N	2025-09-11 03:02:02.387332-04	1
426fea38-add9-4891-bc5a-ea9d408de355	682e3b3fc3001cf46a7e40d5f159a3399b9372f19f4cff144b692e4dbec4c0a0	2025-09-11 03:02:02.389182-04	20250829191104_add_user_onboarding_fields	\N	\N	2025-09-11 03:02:02.388479-04	1
64678818-2d97-41a2-88ed-c87cdaf0ee92	67909bc6d2680328c431f14660d4693bffc24a571241c0194e8b9c3e56f1c160	2025-09-11 03:02:02.39114-04	20250903085421_add_password_reset_tokens	\N	\N	2025-09-11 03:02:02.389374-04	1
da49a79a-1754-4ab0-9cfb-346dd8250f7f	45042010261c1eb1e0703045a78139be8a2114e1fdbfc29dc9558a8fc5821100	2025-09-11 03:02:02.392935-04	20250911065151_add_ai_optimization_reports	\N	\N	2025-09-11 03:02:02.391317-04	1
825bf029-4513-42d6-9e4c-71c25770a811	f717bcd35e51fe7b50d49d32f4ad6de1dd9a9e90a9ccb36db100315af3053340	2025-09-11 03:02:02.413078-04	20250911070112_add_consultation_scheduling_system	\N	\N	2025-09-11 03:02:02.393261-04	1
\.


--
-- Data for Name: ai_optimization_reports; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.ai_optimization_reports (id, email, company, industry, "businessSize", "currentTools", "painPoints", "reportSent", "reportData", "sentAt", "createdAt", "updatedAt") FROM stdin;
6160e1a9-d363-4f53-a354-1ba9efe13df0	gregory.a.starr@gmail.com		Healthcare	Solo (1)	{"Email (Gmail, Outlook)","Social Media Management","Accounting Software"}	{"Too much manual data entry","Invoice and payment processing","Scheduling and calendar management"}	t	{"title": "AI Workflow Optimization Report ", "nextSteps": {"title": "Your Next Steps", "actions": ["Schedule a free 30-minute consultation to discuss your specific needs", "Identify your top 3 automation priorities from the recommendations above", "Review current tools and systems for integration opportunities", "Consider starting with Phase 1 quick wins to build momentum", "Allocate budget and resources for your automation initiative"]}, "generatedAt": "2025-09-11T09:01:27.861Z", "industryAnalysis": {"title": "Healthcare Industry Analysis", "content": "Based on our analysis of the Healthcare industry considering your current tools: Email (Gmail, Outlook), Social Media Management, Accounting Software, we've identified key areas where AI and automation can provide significant value. Healthcare businesses typically see the greatest ROI from automation in areas involving repetitive tasks, data processing, and customer communications.", "keyOpportunities": ["Patient appointment scheduling and reminders", "Medical record digitization and analysis", "Insurance claim processing automation"]}, "workflowAnalysis": {"title": "Workflow Analysis & Automation Opportunities", "currentChallenges": ["Too much manual data entry", "Invoice and payment processing", "Scheduling and calendar management"], "automationOpportunities": ["Reduce manual data entry by 80-90%", "Automate routine communications and follow-ups", "Streamline approval processes and workflows", "Implement intelligent document processing", "Create automated reporting and analytics"]}, "personalizedGreeting": "Thank you for your interest in AI workflow optimization for Solo (1) businesses!", "recommendedSolutions": {"title": "Recommended AI Solutions", "solutions": [{"roi": "250-300% within 4 months", "name": "Patient Communication Hub", "difficulty": "Medium", "timeSaving": "10-15 hours/week", "description": "Automated appointment reminders, follow-up surveys, and patient portal integration with secure messaging."}, {"roi": "400-500% within 6 months", "name": "Claims Processing Assistant", "difficulty": "Advanced", "timeSaving": "20-25 hours/week", "description": "AI-powered insurance claim review, error detection, and automated submission with compliance checks."}]}, "implementationRoadmap": {"title": "Recommended Implementation Roadmap", "phases": [{"phase": "Phase 1: Quick Wins (Weeks 1-4)", "duration": "2-4 weeks", "outcomes": ["Save 5-10 hours per week immediately", "Establish automation foundation", "Build team confidence in AI tools", "Generate initial ROI to fund further automation"], "description": "Implement high-impact, low-complexity automations that provide immediate value."}, {"phase": "Phase 2: Core Systems (Weeks 5-12)", "duration": "6-8 weeks", "outcomes": ["Save an additional 10-20 hours per week", "Improve data accuracy and consistency", "Enhance customer experience", "Reduce operational costs by 20-30%"], "description": "Deploy comprehensive automation systems for your primary business processes."}, {"phase": "Phase 3: Advanced Intelligence (Weeks 13-24)", "duration": "8-12 weeks", "outcomes": ["Achieve predictive capabilities", "Optimize resource allocation", "Enable data-driven decision making", "Scale operations without proportional staff increases"], "description": "Implement advanced AI features like predictive analytics and intelligent decision-making."}]}}	2025-09-11 09:01:27.867	2025-09-11 09:01:27.862	2025-09-11 09:01:27.867
\.


--
-- Data for Name: audit_availability; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.audit_availability (id, "dayOfWeek", "startTime", "endTime", timezone, "isAvailable", "maxBookings", "bufferMinutes", "effectiveFrom", "effectiveTo", "assignedToId", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: audit_blocked_dates; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.audit_blocked_dates (id, "blockedDate", "startTime", "endTime", timezone, reason, notes, "assignedToId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: audit_bookings; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.audit_bookings (id, "scheduledDate", "scheduledTime", duration, timezone, "clientName", "clientEmail", "clientPhone", "companyName", "companySize", industry, "auditType", "currentRevenue", "painPoints", goals, "additionalNotes", "confirmationSent", "reminderSent", "meetingLink", "calendarEventId", "adminNotes", "preparationNotes", "followUpActions", "assignedToId", "userId", "auditCompleted", "auditResults", "recommendedActions", "followUpScheduled", "createdAt", "updatedAt", status) FROM stdin;
\.


--
-- Data for Name: audit_notifications; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.audit_notifications (id, "bookingId", type, "scheduledFor", sent, "sentAt", "recipientEmail", subject, content, attempts, "lastAttempt", "errorMessage", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: audit_templates; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.audit_templates (id, name, description, "auditType", sections, questions, checklists, "estimatedDuration", "followUpRequired", "isActive", "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: calendar_integrations; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.calendar_integrations (id, "userId", provider, "providerAccountId", "accessToken", "refreshToken", "tokenExpiresAt", "defaultCalendarId", "isActive", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.categories (id, name, slug, description, "createdAt", "updatedAt") FROM stdin;
45703cfb-91f3-4a1c-80f6-c453c666c9ad	Web Development	web-development	Web development services and solutions	2025-09-11 07:47:37.81	2025-09-11 07:47:37.81
16804853-e14c-4b18-9cd6-97c3f07e520d	Mobile Development	mobile-development	Mobile app development for iOS and Android	2025-09-11 07:47:37.813	2025-09-11 07:47:37.813
63b10dc3-5c66-4380-9b3a-8d8a1142f400	UI/UX Design	ui-ux-design	User interface and experience design services	2025-09-11 07:47:37.814	2025-09-11 07:47:37.814
e1bffe20-968b-4ef8-9324-5db9fe4079d6	E-commerce	e-commerce	Online store development and solutions	2025-09-11 07:47:37.815	2025-09-11 07:47:37.815
bdc60eef-18e9-400b-9750-40e7890dbe1d	Digital Marketing	digital-marketing	Digital marketing and SEO services	2025-09-11 07:47:37.816	2025-09-11 07:47:37.816
6d5a7d4f-de8c-4691-ba98-670b12b146ce	Content Marketing	content-marketing	Content creation and marketing strategies	2025-09-11 07:47:37.817	2025-09-11 07:47:37.817
b9342a4c-e596-4589-ba07-b868a5c60f5c	Social Media	social-media	Social media management and marketing	2025-09-11 07:47:37.817	2025-09-11 07:47:37.817
6f9788fd-1316-4c71-866e-d0734c54a4dd	Graphic Design	graphic-design	Visual design services for print and digital media	2025-09-11 07:47:37.818	2025-09-11 07:47:37.818
0cb82981-7b30-4dd5-a48f-f066ff15c3ca	Branding	branding	Brand identity and strategy services	2025-09-11 07:47:37.819	2025-09-11 07:47:37.819
da82c582-7617-4a4f-8f15-dd0d1d42b233	Business Strategy	business-strategy	Business consulting and strategy services	2025-09-11 07:47:37.819	2025-09-11 07:47:37.819
e5eb93e8-0edb-4b6c-b32a-44fa0076198a	Startup Resources	startup-resources	Resources and services for startups	2025-09-11 07:47:37.82	2025-09-11 07:47:37.82
340dc459-5a2a-488f-8ea2-963545b605aa	Consulting	consulting	Professional consulting services	2025-09-11 07:47:37.821	2025-09-11 07:47:37.821
4f9ecc23-9189-45e1-ba3b-1b0bd05da1a7	Finance	finance	Financial services and solutions for businesses	2025-09-11 07:47:37.821	2025-09-11 07:47:37.821
ab92408b-0f30-4b74-936a-1f817d0cefde	Accounting	accounting	Accounting and bookkeeping services	2025-09-11 07:47:37.822	2025-09-11 07:47:37.822
34e6035c-5dd2-4052-acf9-0d7130979cf4	HR & Workforce Management	hr-workforce-management	Human resources and workforce management solutions	2025-09-11 07:47:37.823	2025-09-11 07:47:37.823
66c95a59-650a-41a7-9a0c-c9c1c6327e7e	AI Solutions	ai-solutions	Artificial intelligence and automation solutions	2025-09-11 07:47:37.824	2025-09-11 07:47:37.824
20b473d2-fc34-408a-92a2-77c04fcdb5a6	Industry AI	industry-ai	AI solutions tailored for specific industries	2025-09-11 07:47:37.824	2025-09-11 07:47:37.824
785143d9-95cb-40c8-a661-37eec286d91d	Automation	automation	Business process automation solutions	2025-09-11 07:47:37.825	2025-09-11 07:47:37.825
480400f4-3817-42b8-b9f3-b78c705262bd	Training	training	Professional training and skill development services	2025-09-11 07:47:37.825	2025-09-11 07:47:37.825
753a7c58-2d82-46cf-bbfd-6ffd928840a7	Tutorials	tutorials	Step-by-step guides and tutorials	2025-09-11 07:47:37.826	2025-09-11 07:47:37.826
b95e6341-bbd8-4f25-9f69-92f9713f90af	Case Studies	case-studies	Real-world examples and success stories	2025-09-11 07:47:37.827	2025-09-11 07:47:37.827
647562ce-3689-4821-b20b-431d46cecc31	Industry News	industry-news	Latest news and trends in the industry	2025-09-11 07:47:37.827	2025-09-11 07:47:37.827
19334a8a-b822-48e3-8d37-fe6e33fd43d8	Electronics	electronics	Electronic devices and accessories	2025-09-11 07:47:37.828	2025-09-11 07:47:37.828
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.comments (id, content, "postId", "authorId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: consultations; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.consultations (id, title, description, "consultationType", status, "scheduledAt", "completedAt", duration, "timeZone", "clientName", "clientEmail", "clientPhone", company, "teamSize", industry, "meetingType", "meetingUrl", "meetingId", "meetingPassword", objectives, "currentSituation", "desiredOutcome", budget, timeline, "specificQuestions", "consultationNotes", "actionItems", "proposalGenerated", "proposalUrl", "internalNotes", "assignedToId", "userId", "createdAt", "updatedAt") FROM stdin;
c867e331-0024-497d-a995-70103b5834f5	General Consultation - Starrit llc	\N	GENERAL	PENDING	2025-10-09 15:00:00	\N	30	America/New_York	Gregory A Starr	gregory.a.starr@gmail.com	5129533552	Starrit llc	2	Non-profit	VIDEO_CALL	\N	\N	\N	eqrgqegrgg	aefwgqrg	\N	10k-25k	asap	\N	\N	\N	f	\N	\N	\N	\N	2025-09-11 10:49:24.654	2025-09-11 10:49:24.654
7600728e-45db-463d-8996-2ba420ab6479	Technical Consultation - Starrit llc	\N	TECHNICAL	PENDING	2025-11-20 16:00:00	\N	60	America/New_York	Gregory A Starr	gregory.a.starr@gmail.com	5129533552	Starrit llc	1	Other	VIDEO_CALL	\N	\N	\N	fewf	fwfwrrqee	\N	under-10k	asap	verevavf	\N	\N	f	\N	\N	\N	\N	2025-11-15 22:54:53.778	2025-11-15 22:54:53.778
6c47341b-4c20-4db4-8ed9-386a7aa96829	Technical Consultation - Starrit llc	\N	TECHNICAL	PENDING	2025-11-17 16:00:00	\N	60	America/New_York	Gregory A Starr	gregory.a.starr@gmail.com	5129533552	Starrit llc	1	Education	VIDEO_CALL	\N	\N	\N	rgeqegfr	rfreqg	\N	10k-25k	1-month	ergreweqgebvebe ergg tewe geg	\N	\N	f	\N	\N	\N	\N	2025-11-15 22:58:30.536	2025-11-15 22:58:30.536
f5c6a8eb-a5d6-4af5-a211-862086307ec4	Business Strategy - Test Company	\N	STRATEGY	PENDING	2025-11-20 10:00:00	\N	45	America/New_York	Test User	test@example.com	\N	Test Company	\N	\N	VIDEO_CALL	\N	\N	\N	Improve business strategy	Need strategic guidance	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	2025-11-15 23:06:22.745	2025-11-15 23:06:22.745
aee818b5-3d0a-48e1-be19-a62fd3350c1c	Implementation Planning - Starrit llc	\N	IMPLEMENTATION	PENDING	2025-11-26 19:00:00	\N	60	America/New_York	Gregory Starr	gregory.a.starr@gmail.com	5129533552	Starrit llc	1	Finance	IN_PERSON	\N	\N	\N	defeq	\N	\N	under-10k	1-month	\N	\N	\N	f	\N	\N	\N	\N	2025-11-15 23:25:26.41	2025-11-15 23:25:26.41
\.


--
-- Data for Name: contact_forms; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.contact_forms (id, name, email, subject, message, company, phone, status, "createdAt", "updatedAt") FROM stdin;
456e8243-9137-4e98-b955-0925c0173fb3	Gregory A Starr	ceo@astralisone.com	test	wewfe fweff eww weff wf	Starrit llc	5129533552	PENDING	2025-11-15 22:53:03.443	2025-11-15 22:53:03.443
4e6062ab-73d7-4027-81fa-9fc8ff1ac191	Test User	test@example.com	Test Subject	Test message content	Test Company	555-0100	PENDING	2025-11-15 23:06:30.107	2025-11-15 23:06:30.107
385f3a1f-5175-408e-94d6-01092e3ebb10	Gregory Starr	gregory.a.starr@gmail.com	test	installHook.js:1 ClientFetchError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON. Read more at https://errors.authjs.dev#autherror\n    at fetchData (client.js:39:22)\n    at async getSession (react.js:103:21)\n    at async SessionProvider.useEffect [as _getSession] (react.js:251:43)\noverrideMethod @ installHook.js:1Understand this error\nforward-logs-shared.ts:95 [Fast Refresh] rebuilding	Astralis One  llc	5129533552	PENDING	2025-11-17 21:06:58.161	2025-11-17 21:06:58.161
\.


--
-- Data for Name: follow_ups; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.follow_ups (id, type, status, "scheduledAt", "completedAt", subject, message, "emailSent", "emailSentAt", "revenueAuditId", "consultationId", metadata, "createdAt", "updatedAt") FROM stdin;
98c78788-c7db-40a8-83e9-9ed4d8fa4fdf	EMAIL_REMINDER	FAILED	2025-10-08 15:00:00	\N	Reminder: Your Consultation is scheduled for tomorrow	Dear Gregory A Starr,\n\nThis is a friendly reminder that your Consultation with Astralis Agency is scheduled for tomorrow:\n\n📅 Date & Time: Thursday, October 9, 2025 at 11:00 AM EDT\n\n\n\nWhat to Prepare:\n\n• Your current business situation overview  \n• Specific objectives for this consultation\n• Any relevant documents or data\n• Questions you'd like to discuss\n\n\nIf you need to reschedule or have any questions, please reply to this email or call us at (555) 123-4567.\n\nWe're looking forward to speaking with you!\n\nBest regards,\nThe Astralis Agency Team	f	\N	\N	c867e331-0024-497d-a995-70103b5834f5	\N	2025-09-11 10:49:24.688	2025-11-12 05:39:17.609
4c09a784-8984-4f70-b320-e3b751d34c28	EMAIL_REMINDER	PENDING	2025-11-19 16:00:00	\N	Reminder: Your Consultation is scheduled for tomorrow	Dear Gregory A Starr,\n\nThis is a friendly reminder that your Consultation with Astralis Agency is scheduled for tomorrow:\n\n📅 Date & Time: Thursday, November 20, 2025 at 11:00 AM EST\n\n\n\nWhat to Prepare:\n\n• Your current business situation overview  \n• Specific objectives for this consultation\n• Any relevant documents or data\n• Questions you'd like to discuss\n\n\nIf you need to reschedule or have any questions, please reply to this email or call us at (555) 123-4567.\n\nWe're looking forward to speaking with you!\n\nBest regards,\nThe Astralis Agency Team	f	\N	\N	7600728e-45db-463d-8996-2ba420ab6479	\N	2025-11-15 22:54:53.797	2025-11-15 22:54:53.797
9a94b555-1126-4e7b-be00-329ec45b58b8	EMAIL_REMINDER	PENDING	2025-11-25 19:00:00	\N	Reminder: Your Consultation is scheduled for tomorrow	Dear Gregory Starr,\n\nThis is a friendly reminder that your Consultation with Astralis Agency is scheduled for tomorrow:\n\n📅 Date & Time: Wednesday, November 26, 2025 at 02:00 PM EST\n\n\n\nWhat to Prepare:\n\n• Your current business situation overview  \n• Specific objectives for this consultation\n• Any relevant documents or data\n• Questions you'd like to discuss\n\n\nIf you need to reschedule or have any questions, please reply to this email or call us at (555) 123-4567.\n\nWe're looking forward to speaking with you!\n\nBest regards,\nThe Astralis Agency Team	f	\N	\N	aee818b5-3d0a-48e1-be19-a62fd3350c1c	\N	2025-11-15 23:25:26.465	2025-11-15 23:25:26.465
04fda917-c906-4eac-b860-d6b341ad369b	EMAIL_REMINDER	SENT	2025-11-16 16:00:00	2025-11-16 16:03:37.739	Reminder: Your Consultation is scheduled for tomorrow	Dear Gregory A Starr,\n\nThis is a friendly reminder that your Consultation with Astralis Agency is scheduled for tomorrow:\n\n📅 Date & Time: Monday, November 17, 2025 at 11:00 AM EST\n\n\n\nWhat to Prepare:\n\n• Your current business situation overview  \n• Specific objectives for this consultation\n• Any relevant documents or data\n• Questions you'd like to discuss\n\n\nIf you need to reschedule or have any questions, please reply to this email or call us at (555) 123-4567.\n\nWe're looking forward to speaking with you!\n\nBest regards,\nThe Astralis Agency Team	t	2025-11-16 16:03:37.739	\N	6c47341b-4c20-4db4-8ed9-386a7aa96829	\N	2025-11-15 22:58:30.546	2025-11-16 16:03:37.741
0b6a704f-186f-4833-93a4-b31f8a9c7943	EMAIL_REMINDER	SENT	2025-11-16 16:00:00	2025-11-16 20:08:36.33	Reminder: Your Revenue Audit is scheduled for tomorrow	Dear Gregory A Starr,\n\nThis is a friendly reminder that your Revenue Audit with Astralis Agency is scheduled for tomorrow:\n\n📅 Date & Time: Monday, November 17, 2025 at 11:00 AM EST\n\n\n\nWhat to Prepare:\n\n• Current revenue metrics and goals\n• List of existing tools and systems\n• Key challenges you're facing\n• Questions about your revenue operations\n\n\nIf you need to reschedule or have any questions, please reply to this email or call us at (555) 123-4567.\n\nWe're looking forward to speaking with you!\n\nBest regards,\nThe Astralis Agency Team	t	2025-11-16 20:08:36.33	f0417a4b-00b1-4acd-bc1f-66fd8c4007e4	\N	\N	2025-11-15 23:07:22.65	2025-11-16 20:08:36.332
02739b55-3dc4-48b0-b8c1-cc9805b0e3b7	EMAIL_REMINDER	SENT	2025-11-19 09:00:00	2025-11-19 09:36:00.987	Reminder: Your Revenue Audit is scheduled for tomorrow	Dear Test User,\n\nThis is a friendly reminder that your Revenue Audit with Astralis Agency is scheduled for tomorrow:\n\n📅 Date & Time: Thursday, November 20, 2025 at 04:00 AM EST\n\n\n\nWhat to Prepare:\n\n• Current revenue metrics and goals\n• List of existing tools and systems\n• Key challenges you're facing\n• Questions about your revenue operations\n\n\nIf you need to reschedule or have any questions, please reply to this email or call us at (555) 123-4567.\n\nWe're looking forward to speaking with you!\n\nBest regards,\nThe Astralis Agency Team	t	2025-11-19 09:36:00.987	1b2957c1-3e0a-4e1a-a3a8-b9759cd95448	\N	\N	2025-11-15 23:06:22.672	2025-11-19 09:36:00.989
0bc7d9dc-f3b5-4e42-a602-726115c6188a	EMAIL_REMINDER	SENT	2025-11-19 10:00:00	2025-11-19 10:24:56.11	Reminder: Your Consultation is scheduled for tomorrow	Dear Test User,\n\nThis is a friendly reminder that your Consultation with Astralis Agency is scheduled for tomorrow:\n\n📅 Date & Time: Thursday, November 20, 2025 at 05:00 AM EST\n\n\n\nWhat to Prepare:\n\n• Your current business situation overview  \n• Specific objectives for this consultation\n• Any relevant documents or data\n• Questions you'd like to discuss\n\n\nIf you need to reschedule or have any questions, please reply to this email or call us at (555) 123-4567.\n\nWe're looking forward to speaking with you!\n\nBest regards,\nThe Astralis Agency Team	t	2025-11-19 10:24:56.11	\N	f5c6a8eb-a5d6-4af5-a211-862086307ec4	\N	2025-11-15 23:06:22.752	2025-11-19 10:24:56.111
\.


--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.likes (id, "postId", "userId", "createdAt") FROM stdin;
\.


--
-- Data for Name: marketplace_items; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.marketplace_items (id, title, slug, description, price, "imageUrl", status, "categoryId", "sellerId", "createdAt", "updatedAt", specifications, features, stock, weight, dimensions, featured, published, "sortOrder", compatibility, complexity_level, consultation_required, custom_pricing, deliverables, delivery_method, demo_url, digital_download_url, discount_price, documentation_url, duration_type, duration_unit, estimated_duration, faq, gallery_images, industry_focus, is_recurring, item_type, license_type, max_order_quantity, min_order_quantity, prerequisites, price_range_max, price_range_min, rating_average, rating_count, recurring_interval, revision_limit, service_excludes, service_includes, setup_fee, support_duration, support_duration_unit, system_requirements, target_audience, technology_stack, testimonials, video_url, "paypalProductId") FROM stdin;
287cb4e4-ed26-407e-b73a-ef248c243c13	Custom Website Development	custom-website-development	Professional website development services using modern technologies. Our team of experienced developers will create a custom website tailored to your specific needs and requirements. We focus on creating responsive, fast, and user-friendly websites that help you achieve your business goals.	999.99	https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80	AVAILABLE	45703cfb-91f3-4a1c-80f6-c453c666c9ad	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.878	2025-09-11 07:47:37.878	{"support": "3 months", "includes": ["Custom design", "Responsive layout", "Content management system", "SEO optimization", "Analytics integration"], "timeline": "4-6 weeks", "technologies": ["React", "Node.js", "PostgreSQL"]}	{"Custom Design","Responsive Layout","SEO Optimization","Performance Optimization","Content Management System","3 Months Support"}	5	\N	\N	t	t	\N	\N	\N	f	f	\N	DIGITAL	\N	\N	\N	\N	PROJECT_BASED	\N	\N	\N	\N	\N	f	SERVICE	\N	\N	1	\N	\N	\N	0.00	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
e08bb870-c69e-4c5e-8a8a-a27f2f49b115	Custom Web Application Development	custom-web-application-development	Full-stack web application development using modern technologies like React, Node.js, and PostgreSQL. We build scalable, secure, and user-friendly web applications tailored to your business needs.	5000.00	https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop	AVAILABLE	45703cfb-91f3-4a1c-80f6-c453c666c9ad	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.889	2025-09-11 07:47:37.889	\N	\N	3	\N	\N	t	t	\N	\N	Expert	t	t	{"Complete web application source code","Deployment documentation","User manual and training","Technical documentation"}	DEVELOPMENT	\N	\N	\N	\N	PROJECT_BASED	weeks	8	\N	\N	{Technology,E-commerce,Healthcare}	f	SERVICE	\N	\N	1	{"Clear project requirements","Access to necessary business assets","Regular communication availability"}	15000.00	3000.00	0.00	0	\N	3	{"Content creation","Third-party integrations (additional cost)","Ongoing maintenance beyond 3 months"}	{"Requirements analysis and planning","UI/UX design mockups","Frontend development with React","Backend API development","Database design and setup","Testing and quality assurance","Deployment and hosting setup","3 months of free support"}	\N	3	months	\N	{Startups,SMBs,Enterprises}	{React,Node.js,PostgreSQL,AWS}	\N	\N	\N
3cce24cd-d9ca-46f6-9e0a-2c731f01d329	SEO Optimization Package	seo-optimization-package	Comprehensive SEO services to improve your website ranking. Our SEO experts will analyze your website, identify areas for improvement, and implement strategies to increase your visibility in search engines.	499.99	https://images.unsplash.com/photo-1562577309-4932fdd64cd1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80	AVAILABLE	bdc60eef-18e9-400b-9750-40e7890dbe1d	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.891	2025-09-11 07:47:37.891	{"duration": "3 months", "includes": ["Keyword Research", "On-page Optimization", "Content Strategy", "Monthly Reports", "Competitor Analysis", "Backlink Building"]}	{"Keyword Analysis","Technical SEO","Content Optimization","Performance Tracking","Monthly Reporting","Competitor Analysis"}	10	\N	\N	t	t	\N	\N	\N	f	f	\N	CONSULTATION	\N	\N	\N	\N	MONTHLY	months	3	\N	\N	\N	t	SERVICE	\N	\N	1	\N	\N	\N	0.00	0	monthly	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
a9e53fc2-0813-4b88-b668-15cdad702f02	Mobile App Development	mobile-app-development	Professional mobile app development for iOS and Android. Our team will design and develop a custom mobile application that meets your business needs and provides a great user experience.	2499.99	https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80	AVAILABLE	16804853-e14c-4b18-9cd6-97c3f07e520d	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.894	2025-09-11 07:47:37.894	{"support": "6 months", "timeline": "8-12 weeks", "platforms": ["iOS", "Android"], "technologies": ["React Native", "Firebase"]}	{"Custom Design","Cross-Platform Development","User Authentication","Push Notifications","Offline Support","Analytics Integration"}	3	\N	\N	t	t	\N	\N	\N	f	t	\N	DEVELOPMENT	\N	\N	\N	\N	PROJECT_BASED	weeks	12	\N	\N	\N	f	SERVICE	\N	\N	1	\N	5000.00	2000.00	0.00	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
fb001cd2-d715-42b9-85ce-4a97aa7f4d59	Brand Identity Package	brand-identity-package	Complete brand identity design package for startups and small businesses. Our design team will create a cohesive brand identity that reflects your company values and resonates with your target audience.	1299.99	https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80	AVAILABLE	0cb82981-7b30-4dd5-a48f-f066ff15c3ca	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.896	2025-09-11 07:47:37.896	{"timeline": "3-4 weeks", "revisions": "3 rounds", "deliverables": ["Logo Design (multiple concepts)", "Color Palette", "Typography Selection", "Brand Guidelines", "Business Cards", "Letterhead", "Email Signature"]}	{"Logo Design","Brand Guidelines","Color Palette",Typography,"Business Cards","Social Media Templates"}	8	\N	\N	f	t	\N	\N	\N	f	f	\N	DESIGN	\N	\N	\N	\N	PROJECT_BASED	weeks	4	\N	\N	\N	f	SERVICE	\N	\N	1	\N	\N	\N	0.00	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
12f84de0-1e5a-4a08-9eed-4aa1e4eb5f86	AI Foundation Training & Implementation - SMB Starter	ai-foundation-training-smb-starter	Bridge the critical AI skills gap with our comprehensive Foundation program designed specifically for small and medium businesses. This entry-level service provides essential AI literacy, practical tool implementation, and hands-on training to get your team started with confidence. Perfect for businesses taking their first steps into AI transformation.	1999.00	https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop	AVAILABLE	480400f4-3817-42b8-b9f3-b78c705262bd	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.898	2025-09-11 07:47:37.898	{"support": "30 days email support", "duration": "6 weeks", "includes": ["AI fundamentals and business applications", "Practical tool training and setup", "Implementation planning and roadmap", "ROI measurement framework", "Change management strategies", "Ongoing support and troubleshooting"], "groupSize": "Up to 10 participants", "skillLevel": "Beginner to Intermediate", "certification": "AI Foundation Certificate", "trainingFormat": "Hybrid (online + in-person workshops)"}	{"Industry-Specific AI Assessment","Executive Leadership Briefing","Hands-On Tool Implementation","Team Training & Certification","Quick-Win Identification","ROI Measurement Setup","30-Day Implementation Support","Skills Gap Analysis & Bridge Plan"}	8	\N	\N	t	t	\N	\N	Beginner	t	f	{"Comprehensive AI readiness assessment report","Customized AI strategy roadmap (12-month)","Team training completion certificates","Implementation toolkit with templates and checklists","Selected AI tools setup and configuration","ROI tracking dashboard and measurement plan"}	CONSULTATION	\N	\N	\N	\N	PROJECT_BASED	weeks	6	\N	\N	{"Professional Services",Retail,Healthcare,Manufacturing}	f	SERVICE	\N	\N	1	{"Basic computer literacy across team","Commitment to 6-week program timeline","Leadership buy-in for AI adoption initiative","Access to current business processes and data"}	1999.00	1999.00	0.00	0	\N	2	{"Advanced technical implementation","Custom AI model development","Extended ongoing support beyond 30 days","Enterprise-level integrations"}	{"AI readiness assessment tailored to your industry","Executive briefing on AI opportunities and risks","16 hours of foundational AI training for up to 10 team members","Hands-on workshops with 3 practical AI tools","Basic implementation roadmap and quick-win identification","Tool selection guidance for immediate productivity gains","30-day email support for implementation questions","ROI measurement framework and success metrics setup"}	\N	1	months	\N	{SMBs,Startups,"Small Teams"}	{ChatGPT,Zapier,"Notion AI","Canva AI"}	\N	\N	\N
1aed5f2d-3065-4740-b43f-135754edc0ad	Small Business Contract & Invoice Kit	small-business-contract-invoice-kit	Legally-reviewed contract and invoice templates in customizable formats. Designed for service businesses, freelancers, and consultants to protect revenue and maintain professionalism.	99.00	https://images.unsplash.com/photo-1581090700227-1e8e02a07429?w=800&h=600&fit=crop	AVAILABLE	da82c582-7617-4a4f-8f15-dd0d1d42b233	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:38.001	2025-09-11 07:47:38.001	\N	{"Services agreement (MSA + SOW)","Retainer & invoice templates","Editable PDFs and Google Docs","Client onboarding checklist"}	999999	\N	\N	f	t	\N	\N	\N	f	f	\N	DIGITAL	\N	\N	\N	\N	ONE_TIME	\N	\N	\N	\N	\N	f	PRODUCT	\N	\N	1	\N	\N	\N	0.00	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
305657c2-a918-41d8-ae69-59971dc47f71	AI Accelerator Training & Implementation - SMB Professional	ai-accelerator-training-smb-professional	Accelerate your AI adoption with our comprehensive Professional program that addresses the critical skills gap through advanced training and strategic implementation. Designed for SMBs ready to scale their AI capabilities with sophisticated tools, process automation, and measurable business outcomes.	4999.00	https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop	AVAILABLE	480400f4-3817-42b8-b9f3-b78c705262bd	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.9	2025-09-11 07:47:37.9	{"support": "90 days comprehensive support", "duration": "12 weeks intensive program", "includes": ["Advanced AI strategy development", "Multi-platform implementation training", "Process automation and workflow optimization", "Pilot project execution and scaling", "Advanced analytics and ROI measurement", "Change management and adoption programs"], "groupSize": "Up to 20 participants across multiple levels", "skillLevel": "Intermediate to Advanced", "certification": "AI Professional Certificate + Platform Certifications", "trainingFormat": "Comprehensive hybrid delivery"}	{"Advanced AI Maturity Assessment","Multi-Level Training Program (40 Hours)","Process Automation Implementation","Pilot Project Execution","Advanced ROI Analytics","Change Management Program","90-Day Comprehensive Support","Platform Certification Training"}	5	\N	\N	t	t	\N	\N	Intermediate	t	f	{"Detailed AI maturity assessment with gap analysis","Advanced AI strategy and implementation roadmap","Comprehensive training materials and resources","Fully implemented pilot project with documentation","Process automation workflows (3 complete implementations)","Advanced ROI dashboard with predictive analytics","Change management playbook and adoption metrics","Team certification in multiple AI platforms"}	CONSULTATION	\N	\N	\N	\N	PROJECT_BASED	weeks	12	\N	\N	{Technology,"Financial Services",Healthcare,Legal,Consulting}	f	SERVICE	\N	\N	1	{"Completed Foundation program or equivalent AI knowledge","Dedicated project team (2-4 people)","Executive sponsorship and budget approval","Access to business data and systems for integration"}	4999.00	4999.00	0.00	0	\N	3	{"Enterprise-grade custom AI development","Ongoing management beyond 90 days","Hardware procurement and setup","Third-party software licensing fees"}	{"Comprehensive AI maturity assessment with competitive analysis","Multi-level training program (40 hours) for leadership and technical teams","Advanced workshops covering 8+ AI platforms and integrations","Complete process automation implementation for 3 key workflows","Custom AI strategy development with 18-month roadmap","Pilot project design, execution, and optimization","Change management program with adoption tracking","90-day hands-on support with weekly check-ins","Advanced ROI measurement and continuous improvement framework"}	\N	3	months	\N	{"Growing SMBs","Mid-Market Companies",Scale-ups}	{"OpenAI API","Microsoft Power Platform",Zapier,Airtable,"Slack AI","HubSpot AI"}	\N	\N	\N
3429784e-dec4-479a-80df-33560b21f439	AI Transformation Training & Implementation - SMB Enterprise	ai-transformation-training-smb-enterprise	Complete AI transformation for ambitious SMBs ready to become AI-first organizations. This comprehensive program addresses the skills gap at every level while implementing enterprise-grade AI solutions that drive significant competitive advantage and measurable business growth.	9999.00	https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop	AVAILABLE	480400f4-3817-42b8-b9f3-b78c705262bd	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.903	2025-09-11 07:47:37.903	{"support": "6 months dedicated consultant support", "duration": "20 weeks transformation program", "includes": ["Enterprise AI strategy and competitive positioning", "Organization-wide training and certification", "Full business process transformation", "Custom AI solution development", "Advanced predictive analytics implementation", "AI governance and ethical framework development"], "groupSize": "Organization-wide (up to 50 participants)", "skillLevel": "All levels (Beginner to Expert)", "certification": "AI Transformation Certificate + Enterprise Certifications", "trainingFormat": "Comprehensive enterprise delivery"}	{"Enterprise AI Transformation Strategy","Organization-Wide Training (80 Hours)","Custom AI Solution Development","Full Process Transformation","Advanced Predictive Analytics","AI Governance Framework","6-Month Dedicated Support","Competitive Advantage Analysis"}	2	\N	\N	t	t	\N	\N	Expert	t	t	{"Complete AI transformation strategy and implementation plan","Enterprise-grade AI training curriculum and certification program","Fully implemented AI-driven business processes (5+ workflows)","Custom AI solutions integrated with business systems","Advanced analytics platform with predictive capabilities","AI governance framework and ethical guidelines","Comprehensive change management program and culture playbook","Scaling roadmap with competitive advantage analysis","Executive dashboard with real-time AI performance metrics"}	CONSULTATION	\N	\N	\N	\N	PROJECT_BASED	weeks	20	\N	\N	{Technology,"Financial Services",Healthcare,Manufacturing,"Professional Services"}	f	SERVICE	\N	\N	1	{"Completed Accelerator program or demonstrated AI proficiency","Dedicated transformation team (5+ people)","C-level executive sponsorship and transformation mandate","Substantial budget allocation for technology and change management","Enterprise-level data infrastructure or willingness to invest"}	15000.00	9999.00	0.00	0	\N	5	{"Ongoing AI consultant retainer beyond 6 months","Hardware infrastructure procurement","Third-party enterprise software licensing","Legal compliance consulting"}	{"Enterprise-level AI readiness and competitive positioning analysis","Comprehensive 80-hour training program across all organizational levels","Full-scale implementation of AI-driven business transformation","Custom AI solution development for core business processes","Advanced integration with existing enterprise systems","Comprehensive change management and culture transformation program","Multiple pilot projects with scaling strategies","6-month ongoing support with dedicated AI consultant","Advanced predictive analytics and business intelligence implementation","AI governance framework and ethical AI guidelines development"}	\N	6	months	\N	{"Established SMBs","Growth Companies","Market Leaders"}	{"Custom AI Solutions","Enterprise APIs","Microsoft Azure AI","AWS AI Services","Advanced Analytics Platforms"}	\N	\N	\N
d45a953c-d5cf-4197-8295-1eba05632018	AI Business Growth Accelerator - Growth Tier	ai-business-growth-accelerator-growth	Transform your SMB with AI-powered strategic insights that drive real revenue growth. Join the 91% of AI-adopting SMBs experiencing accelerated business expansion. Our Growth tier provides essential market intelligence, strategic planning assistance, and performance optimization to establish your competitive advantage.	799.00	https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop	AVAILABLE	da82c582-7617-4a4f-8f15-dd0d1d42b233	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.905	2025-09-11 07:47:37.905	{"aiCapabilities": ["Market trend analysis and prediction", "Competitor intelligence gathering", "Strategic recommendation generation", "Performance optimization suggestions"], "dataIntegration": ["Google Analytics", "CRM systems", "Financial data sources"], "deliverySchedule": "Monthly reports and ongoing dashboard access", "reportingFeatures": ["Interactive performance dashboards", "Monthly strategic insights reports", "Growth opportunity assessments", "Competitive positioning analysis"]}	{"AI-Powered Market Analysis","Competitor Intelligence Reports","Strategic Growth Recommendations","Performance Tracking Dashboard","Monthly Strategy Sessions","Growth Opportunity Identification","Email Support","Basic Benchmarking"}	25	\N	\N	t	t	\N	\N	Intermediate	t	f	{"Monthly market analysis report","AI-generated strategic recommendations document","Performance dashboard access","Growth opportunity priority matrix","Competitor benchmarking report"}	CONSULTATION	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{Technology,E-commerce,"Professional Services",Healthcare,Finance}	t	SERVICE	\N	\N	1	{"Basic business operations data access","Monthly strategic planning session participation","Clear business objectives and goals"}	799.00	799.00	0.00	0	monthly	2	{"Implementation of recommended strategies","Advanced competitive analysis (available in higher tiers)","Custom integration development","Daily monitoring and alerts","Priority support"}	{"Monthly market opportunity analysis and trend identification","AI-powered competitor intelligence and benchmarking reports","Strategic business growth recommendations based on market data","Performance dashboard with key growth metrics tracking","Monthly strategic planning session with AI insights","Basic growth pathway identification and prioritization","Email support for strategic questions","Monthly performance report with actionable insights"}	\N	1	month	\N	{SMBs,Startups,"Growing Businesses"}	{"AI Analytics","Market Intelligence APIs","Business Intelligence Tools","Data Visualization"}	\N	\N	\N
22a1a202-309a-4f86-a0ce-90a165934631	AI Business Growth Accelerator - Accelerate Tier	ai-business-growth-accelerator-accelerate	Supercharge your business growth with advanced AI-driven strategic intelligence and automated competitive monitoring. The Accelerate tier delivers comprehensive market insights, detailed growth pathway optimization, and proactive strategic alerts that keep you ahead of market changes and competitor moves.	1499.00	https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop	AVAILABLE	da82c582-7617-4a4f-8f15-dd0d1d42b233	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.908	2025-09-11 07:47:37.908	{"aiCapabilities": ["Predictive market modeling and forecasting", "Real-time competitor movement tracking", "Strategic scenario planning and optimization", "ROI prediction and optimization modeling", "Market timing analysis for strategic initiatives"], "dataIntegration": ["CRM systems", "Financial platforms", "Marketing analytics", "Industry databases"], "deliverySchedule": "Bi-weekly reports, weekly alerts, ongoing dashboard access", "reportingFeatures": ["Real-time competitive intelligence dashboard", "Predictive analytics and forecasting", "Investment-ready performance reports", "Strategic scenario modeling", "Advanced ROI tracking and optimization"]}	{"Advanced AI Market Modeling","Real-time Competitor Monitoring","Predictive Growth Analytics","Investment Readiness Reports","Bi-weekly Strategy Sessions","ROI Optimization Modeling","Priority Support (4hr Response)","Strategic Alert Notifications","Advanced Benchmarking","Custom KPI Tracking"}	15	\N	\N	t	t	\N	\N	Advanced	t	f	{"Advanced market intelligence reports (bi-weekly)","Comprehensive competitor analysis dashboard","Strategic growth roadmap with timeline and milestones","Investment-ready performance reports","Advanced analytics dashboard with predictive insights","ROI optimization recommendations","Strategic alert notifications","Quarterly growth strategy review"}	CONSULTATION	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{Technology,SaaS,E-commerce,FinTech,HealthTech,"Professional Services"}	t	SERVICE	\N	\N	1	{"Business data integration capabilities","Bi-weekly strategic session participation","Access to key performance metrics and financial data","Commitment to implementing strategic recommendations"}	1499.00	1499.00	0.00	0	monthly	5	{"Custom software development or implementation","Complete business model restructuring","Legal or financial advisory services","Direct marketing campaign execution"}	{"Advanced market opportunity analysis with predictive modeling","Real-time competitor monitoring with automated alerts","Comprehensive strategic business planning with AI optimization","Advanced performance analytics with predictive insights","Bi-weekly strategic planning sessions with dedicated strategist","Detailed growth pathway optimization with ROI projections","Priority email and chat support with 4-hour response time","Weekly performance updates and strategic alerts","Investment readiness assessment and reporting","Custom KPI tracking and optimization recommendations","Advanced competitor deep-dive analysis","Market timing recommendations for strategic initiatives"}	\N	1	month	\N	{"Scaling SMBs","Growth-Stage Companies","Investment-Seeking Businesses"}	{"Advanced AI Analytics","Predictive Modeling","Real-time Market APIs","Business Intelligence Platforms"}	\N	\N	\N
5022c414-59a1-46e8-b46c-f3e2f4802d73	AI Business Growth Accelerator - Transform Tier	ai-business-growth-accelerator-transform	Revolutionize your business with enterprise-grade AI strategic intelligence and comprehensive growth transformation services. The Transform tier provides deep market analysis, custom AI model development, complete business optimization, and dedicated strategic partnership to achieve exceptional growth outcomes.	2999.00	https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop	AVAILABLE	da82c582-7617-4a4f-8f15-dd0d1d42b233	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.91	2025-09-11 07:47:37.91	{"aiCapabilities": ["Custom machine learning model development", "Enterprise-grade predictive analytics", "Advanced market simulation and scenario planning", "Real-time strategic recommendation engine", "Automated competitive intelligence gathering", "Custom business optimization algorithms"], "dataIntegration": ["Enterprise CRM", "ERP systems", "Financial platforms", "Industry databases", "Custom APIs"], "deliverySchedule": "Daily alerts, weekly reports, quarterly strategic reviews", "reportingFeatures": ["Custom strategic intelligence platform", "Real-time executive dashboards", "Board-ready presentation materials", "Investment-grade financial modeling", "Advanced competitive intelligence system", "Strategic scenario planning tools"]}	{"Custom AI Model Development","Enterprise Market Intelligence","Business Transformation Planning","Weekly C-Level Strategy Sessions","24/7 Priority Support","Custom Analytics Platform","Daily Strategic Alerts","Investment-Grade Financial Modeling","Board-Ready Materials","Strategic Partnership Analysis","Process Optimization Framework","Quarterly Planning Retreats"}	5	\N	\N	t	t	\N	\N	Expert	t	f	{"Custom AI strategic intelligence platform","Comprehensive business transformation roadmap","Weekly strategic intelligence reports","Enterprise-grade analytics dashboard","Investment banker-quality financial models","Board presentation materials","Quarterly strategic planning materials","Custom competitive intelligence system","Advanced ROI optimization framework","Strategic partnership opportunity analysis"}	CONSULTATION	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{Technology,SaaS,FinTech,HealthTech,AI/ML,"Advanced Manufacturing","Professional Services"}	t	SERVICE	\N	\N	1	{"Enterprise data infrastructure or willingness to develop","Weekly strategic session commitment from leadership team","Access to comprehensive business and financial data","Commitment to business transformation initiatives","Minimum 12-month engagement commitment"}	2999.00	2999.00	0.00	0	monthly	10	{"Legal services and compliance advisory","Direct implementation of recommended changes","Acquisition or merger advisory services","Capital raising services"}	{"Custom AI model development for your specific industry and business","Enterprise-grade market intelligence with proprietary data sources","Complete business model optimization and transformation guidance","Weekly strategic planning sessions with C-level strategist","24/7 priority support with dedicated account manager","Custom dashboard development and advanced analytics platform","Daily strategic alerts and market intelligence updates","Comprehensive competitor intelligence with deep-dive analysis","Investment banker-grade financial modeling and projections","Strategic partnership identification and opportunity analysis","Advanced business process optimization recommendations","Custom integration development for seamless data flow","Quarterly strategic planning retreats and growth workshops","Board-ready presentation materials and investor updates"}	\N	1	month	\N	{"Enterprise SMBs","High-Growth Companies","Pre-IPO Organizations","Private Equity Portfolio Companies"}	{"Custom AI Development","Enterprise Analytics Platforms","Advanced Machine Learning","Real-time Data Processing"}	\N	\N	\N
51e5cfbe-0bb0-4857-a9d3-6388cd259263	AI-Driven Financial Intelligence Service - Essential	ai-financial-intelligence-essential	Transform your SMB financial management with AI-powered automation. Our Essential plan provides intelligent bookkeeping, cash flow forecasting, and fraud detection to save you $500-$2,000 monthly while improving financial decision-making. Perfect for small businesses ready to eliminate manual financial tasks and gain real-time insights.	199.00	https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80	AVAILABLE	4f9ecc23-9189-45e1-ba3b-1b0bd05da1a7	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.912	2025-09-11 07:47:37.912	{"roi": "Save $500-$1,000 monthly on bookkeeping costs", "support": "24-hour email response time", "accuracy": "99.5% transaction categorization accuracy", "security": "Bank-level 256-bit SSL encryption", "integrations": ["QuickBooks", "Xero", "Major US Banks"], "timeReduction": "80% reduction in manual financial tasks"}	{"Automated Bookkeeping","Cash Flow Forecasting","Fraud Detection","Financial Dashboards","Bank Integration","Mobile Access","Monthly Reporting","Tax Assistance"}	100	\N	\N	t	t	\N	\N	Beginner	f	f	{"Automated financial data processing","Monthly comprehensive financial reports","Real-time dashboard access","Fraud detection alerts","Mobile app for financial monitoring"}	DIGITAL	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{Retail,"Professional Services",E-commerce}	t	SERVICE	\N	\N	1	{"Active business bank account","Accounting software subscription (QuickBooks or Xero)","Internet connectivity for real-time sync"}	\N	\N	0.00	0	monthly	\N	{"Custom financial modeling","Advanced tax optimization strategies","Dedicated account manager","API access for custom integrations","Advanced compliance reporting"}	{"Automated transaction categorization and reconciliation","Basic cash flow forecasting (3-month outlook)","Fraud detection and anomaly alerts","Monthly financial reports and dashboards","QuickBooks and Xero integration","Bank account connectivity (up to 3 accounts)","Mobile app access for iOS and Android","Email support with 24-hour response time","Basic tax preparation assistance","Monthly financial health score"}	\N	1	month	\N	{"Small Businesses",Startups,Freelancers}	{"Machine Learning","Cloud Computing","API Integration","Real-time Analytics"}	\N	\N	\N
4d6c8c13-1ce4-473b-911c-4ec1d7d123a8	AI-Driven Financial Intelligence Service - Professional	ai-financial-intelligence-professional	Advanced AI financial intelligence for growing SMBs. Our Professional plan includes predictive analytics, advanced fraud prevention, comprehensive tax optimization, and dedicated support. Save $1,000-$1,500 monthly while gaining sophisticated financial insights and automated compliance reporting.	449.00	https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80	AVAILABLE	4f9ecc23-9189-45e1-ba3b-1b0bd05da1a7	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.914	2025-09-11 07:47:37.914	{"roi": "Save $1,000-$1,500 monthly on financial management costs", "support": "Priority support with 4-hour response time", "accuracy": "99.7% forecasting accuracy for 3-month outlook", "security": "SOC 2 Type II compliant with advanced threat detection", "integrations": ["QuickBooks", "Xero", "NetSuite", "20+ platforms"], "timeReduction": "85% reduction in financial reporting time"}	{"All Essential Features","Predictive Analytics","Scenario Planning","Advanced Tax Optimization","Custom Reporting","Budget Analysis","Priority Support","Compliance Reporting"}	50	\N	\N	t	t	\N	\N	Intermediate	t	f	{"All Essential plan deliverables","Advanced predictive financial models","Custom reporting dashboards","Quarterly strategic financial reviews","Tax optimization recommendations","Compliance documentation"}	DIGITAL	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{Manufacturing,Healthcare,Technology,"Professional Services"}	t	SERVICE	\N	\N	1	{"Active business bank accounts","Accounting software subscription","Minimum 6 months of financial history","Regular financial data updates"}	\N	\N	0.00	0	monthly	\N	{"Dedicated account manager","Custom API development","On-site consultation","White-label solutions"}	{"Everything in Essential plan","Advanced predictive cash flow modeling (12-month outlook)","Scenario planning and financial forecasting","Advanced fraud prevention with machine learning","Comprehensive tax optimization strategies","Custom financial reporting and analytics","Budget planning and variance analysis","Unlimited bank account connectivity","Priority phone and email support (4-hour response)","Quarterly business review calls","Advanced compliance reporting","Integration with 20+ accounting platforms","Custom dashboard configuration"}	\N	1	month	\N	{"Growing SMBs","Mid-market Companies","Professional Services"}	{"Advanced ML","Predictive Analytics","Cloud Computing","Multi-platform APIs"}	\N	\N	\N
ed1175b6-326d-4816-b997-a730038861d1	AI-Driven Financial Intelligence Service - Enterprise	ai-financial-intelligence-enterprise	Enterprise-grade AI financial intelligence for established businesses. Our Enterprise plan offers dedicated account management, custom API access, advanced compliance features, and white-label capabilities. Save $1,500-$2,000+ monthly while accessing the most sophisticated financial AI technology available.	899.00	https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80	AVAILABLE	4f9ecc23-9189-45e1-ba3b-1b0bd05da1a7	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.916	2025-09-11 07:47:37.916	{"roi": "Save $1,500-$2,000+ monthly on financial operations", "support": "Dedicated support team with 1-hour response guarantee", "accuracy": "99.9% accuracy with custom-trained models", "security": "Enterprise-grade with SOC 2, ISO 27001, and custom compliance", "integrations": "Custom API for any financial system", "timeReduction": "90% reduction in financial reporting and analysis time"}	{"All Professional Features","Dedicated Account Manager","Custom API Access","Multi-entity Consolidation","White-label Options","Advanced Compliance","24/7 Priority Support","Custom ML Models"}	20	\N	\N	t	t	\N	\N	Expert	t	f	{"All Professional plan deliverables","Custom API integration","Dedicated account management","Custom ML models for business-specific insights","White-label financial intelligence platform","Advanced compliance documentation","Strategic financial consulting reports"}	DIGITAL	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{"Financial Services",Manufacturing,Healthcare,Technology,"Real Estate"}	t	SERVICE	\N	\N	1	{"Multiple business entities or complex structure","Dedicated IT resources for integration","Minimum $5M annual revenue","Established financial processes and controls"}	\N	\N	0.00	0	monthly	\N	{"Custom on-premise deployment (available as add-on)","Third-party audit services"}	{"Everything in Professional plan","Dedicated account manager and financial strategist","Custom API access for system integrations","Advanced multi-entity consolidation","Real-time financial risk assessment","Custom machine learning model development","White-label dashboard options","Advanced compliance and audit support","Monthly strategic consultation calls","Custom workflow automation","Advanced security with SSO integration","Unlimited user accounts and permissions","24/7 priority support with 1-hour response","On-site training and consultation options"}	\N	1	month	\N	{Enterprise,"Multi-entity Businesses","Financial Services"}	{"Custom ML","Enterprise APIs","Multi-tenant Architecture","Advanced Security"}	\N	\N	\N
b11ad1e5-9d12-497b-bc74-572bdefce4f3	Website Conversion Booster Toolkit	website-conversion-booster-toolkit	Conversion-focused copywriting swipe files, CTA design samples, and plug-and-play A/B testing templates. Ideal for Shopify, WordPress, and Webflow users.	159.00	https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop	AVAILABLE	63b10dc3-5c66-4380-9b3a-8d8a1142f400	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:38.002	2025-09-11 07:47:38.002	\N	{"100+ CTA button samples","Headline formulas cheat sheet","A/B testing tracker","Video walkthroughs"}	999999	\N	\N	f	t	\N	\N	\N	f	f	\N	DIGITAL	\N	\N	\N	\N	ONE_TIME	\N	\N	\N	\N	\N	f	PRODUCT	\N	\N	1	\N	\N	\N	0.00	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
659df615-d5f1-4017-8352-a4e8a5dd8d24	24/7 AI Customer Support System - Essential	24-7-ai-customer-support-essential	Transform your customer service with our Essential AI Customer Support System. Perfect for SMBs looking to provide 24/7 customer service without hiring additional staff. Our intelligent chatbots handle 70% of customer inquiries automatically, with seamless handoff to human agents for complex issues. Includes multi-channel support across website, email, and basic social media platforms.	149.00	https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop	AVAILABLE	66c95a59-650a-41a7-9a0c-c9c1c6327e7e	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.918	2025-09-11 07:47:37.918	{"channels": ["Website Chat", "Email", "Basic Social Media"], "analytics": "Basic performance metrics", "languages": ["English"], "integration": "Standard help desk systems", "responseTime": "Instant for automated responses, <2 hours for human handoff", "trainingData": "Standard FAQ and knowledge base", "customization": "Template-based responses", "automationRate": "70% of inquiries handled automatically"}	{"Intelligent Chatbot with NLP","Multi-channel Support (3 channels)","70% Automation Rate","Human Agent Handoff","Basic Sentiment Analysis","Automated Ticket Routing","Performance Analytics Dashboard","Standard Response Templates","24/7 Availability","Email Support Integration","Basic Knowledge Base","Setup and Training Included"}	50	\N	\N	t	t	\N	\N	Intermediate	t	f	{"Configured AI chatbot system","Multi-channel integration setup","Basic analytics dashboard access","User training documentation","System administration guide","30-day performance report"}	DIGITAL	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{Retail,E-commerce,"Professional Services"}	t	SERVICE	\N	\N	1	{"Existing website or help desk system","Basic customer service documentation","Access to current FAQ and knowledge base","Designated point of contact for setup"}	\N	\N	0.00	0	monthly	2	{"Custom integrations beyond standard platforms","Advanced sentiment analysis","Multilingual support","Custom response development","Advanced analytics and reporting","Priority support","Additional training sessions"}	{"Initial setup and configuration","Basic chatbot training with standard FAQ","Multi-channel integration (website, email, social)","Human agent handoff system","Basic performance analytics dashboard","Standard response templates","30 days of setup support","Basic user training (2 hours)","Knowledge base integration","Automated ticket routing"}	299.00	1	month	\N	{"Small Businesses",SMBs,Startups}	{"Natural Language Processing","Machine Learning","REST APIs",Webhooks}	\N	\N	\N
5ef8405b-091b-4336-a87b-0e7d0674dccd	24/7 AI Customer Support System - Professional	24-7-ai-customer-support-professional	Advanced AI Customer Support System designed for growing businesses. Handles 80% of customer inquiries with advanced NLP and sentiment analysis. Includes comprehensive multi-channel support (website, social media, email, SMS), advanced analytics, and customizable response systems. Perfect for businesses scaling their customer service operations.	349.00	https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop	AVAILABLE	66c95a59-650a-41a7-9a0c-c9c1c6327e7e	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.921	2025-09-11 07:47:37.921	{"channels": ["Website Chat", "Email", "Social Media", "SMS", "WhatsApp"], "analytics": "Advanced performance metrics and customer insights", "languages": ["English", "Spanish", "French"], "integration": "Advanced help desk and CRM systems", "responseTime": "Instant for automated responses, <1 hour for human handoff", "trainingData": "Custom training with business-specific data", "customization": "Custom response development and branding", "automationRate": "80% of inquiries handled automatically"}	{"Advanced AI with Deep Learning","Multi-channel Support (5+ channels)","80% Automation Rate","Advanced Sentiment Analysis","Real-time Escalation Rules","Custom Response Development","Advanced Analytics & Insights","Multilingual Support (3 languages)","CRM Integration","Priority Ticket Routing","Customer Journey Tracking","A/B Testing for Responses","White-label Branding","Advanced Knowledge Base AI"}	25	\N	\N	t	t	\N	\N	Advanced	t	f	{"Advanced AI chatbot system","Multi-channel integration (5+ platforms)","Custom-branded interface","Advanced analytics dashboard","Comprehensive user training materials","Monthly optimization recommendations","Custom escalation workflow","Performance benchmarking report"}	DIGITAL	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{E-commerce,SaaS,Healthcare,"Financial Services"}	t	SERVICE	\N	\N	1	{"Existing CRM or help desk system","Comprehensive customer service documentation","Historical customer interaction data","Dedicated team for training and implementation","Brand guidelines for customization"}	\N	\N	0.00	0	monthly	5	{"Enterprise-level custom integrations","Languages beyond the included 3","Additional custom response development beyond 50","Dedicated account management","Custom machine learning model development"}	{"Advanced setup and configuration","Custom chatbot training with business data","Multi-channel integration (5+ platforms)","Advanced sentiment analysis setup","Custom response development (up to 50 responses)","CRM and help desk integrations","Advanced analytics dashboard","Multilingual support configuration","60 days of setup support","Comprehensive user training (8 hours)","Monthly optimization sessions","Custom escalation rules","White-label branding setup"}	499.00	2	months	\N	{SMBs,"Mid-Market Companies","Growing Businesses"}	{"Advanced NLP","Deep Learning","API Integrations","Real-time Analytics"}	\N	\N	\N
86387e1b-10b4-423d-96e3-8f430f827db9	24/7 AI Customer Support System - Enterprise	24-7-ai-customer-support-enterprise	Enterprise-grade AI Customer Support System providing 90% automation with custom machine learning models. Includes unlimited channels, advanced analytics, dedicated account management, and custom integrations. Features predictive support capabilities, advanced customer journey analysis, and enterprise-level security. Perfect for large organizations with complex customer service needs.	699.00	https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop	AVAILABLE	66c95a59-650a-41a7-9a0c-c9c1c6327e7e	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.923	2025-09-11 07:47:37.923	{"channels": "Unlimited (Website, Email, Social Media, SMS, Voice, Mobile App, etc.)", "analytics": "Enterprise-grade analytics with predictive insights", "languages": "Unlimited with custom language models", "integration": "Custom integrations with any system", "responseTime": "Instant for automated responses, <30 minutes for human handoff", "trainingData": "Custom machine learning models trained on enterprise data", "customization": "Fully custom AI models and unlimited response development", "automationRate": "90% of inquiries handled automatically"}	{"Custom Machine Learning Models","Unlimited Channel Support","90% Automation Rate","Predictive Customer Support","Advanced Customer Journey Analysis","Unlimited Custom Responses","Enterprise Analytics Suite","Unlimited Language Support","Custom System Integrations","Dedicated Account Manager","Real-time Performance Monitoring","Advanced Security & Compliance","Voice AI Integration","Proactive Issue Detection","Custom Workflow Automation","Enterprise SSO Integration"}	10	\N	\N	t	t	\N	\N	Expert	t	f	{"Custom-trained AI models","Enterprise-grade platform access","Unlimited channel integrations","Advanced analytics and reporting suite","Comprehensive documentation package","Custom workflow automations","Security and compliance documentation","Enterprise training materials","Dedicated support portal access","Quarterly performance reviews"}	DIGITAL	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{"Enterprise Software","Financial Services",Healthcare,Government,Telecommunications}	t	SERVICE	\N	\N	1	{"Enterprise CRM/help desk infrastructure","Comprehensive historical customer data","Dedicated IT team for integration","Enterprise security requirements documentation","Executive sponsorship and dedicated project team"}	\N	\N	0.00	0	monthly	\N	{"Hardware infrastructure costs","Additional custom integrations beyond 10","On-premise deployment (cloud-based solution)","Third-party licensing fees"}	{"Enterprise-level setup and configuration","Custom machine learning model development","Unlimited channel integrations","Advanced predictive analytics setup","Unlimited custom response development","Custom system integrations (up to 10)","Enterprise analytics dashboard","Unlimited language support setup","90 days of dedicated setup support","Dedicated account management","Monthly strategy sessions","Advanced security configuration","Custom workflow automation","Enterprise training program (20+ hours)","Quarterly optimization reviews","Priority technical support"}	999.00	6	months	\N	{"Large Enterprises","Fortune 500","Government Agencies"}	{"Custom ML Models","Enterprise APIs","Advanced Analytics","Cloud Infrastructure","Security Frameworks"}	\N	\N	\N
80c4ee51-3dcb-4445-91a1-aaa7480e7a3e	Autonomous Business Operations Agent - Core	autonomous-business-operations-agent-core	Transform your small business operations with AI-powered automation. Our Core tier delivers essential business process automation that saves 20-30% of manual work time while reducing operational errors by up to 85%. Perfect for SMBs ready to embrace autonomous operations with seamless integration into existing workflows.	249.00	https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop	AVAILABLE	785143d9-95cb-40c8-a661-37eec286d91d	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.925	2025-09-11 07:47:37.925	{"roi": {"paybackPeriod": "2-3 months", "errorReduction": "85%", "costSavingsMonthly": "$800-1200", "timeSavingsPerWeek": "8-12 hours"}, "security": ["Bank-grade encryption", "SOC 2 Type II compliance", "Regular security audits", "GDPR compliance"], "integrations": ["QuickBooks Online/Desktop", "Google Calendar/Outlook", "Gmail/Outlook Email", "Basic CRM systems", "Square/Stripe payment processing", "Excel/Google Sheets"], "automationCapabilities": ["Invoice processing and validation", "Payment reminder sequences", "Appointment scheduling and confirmations", "Customer follow-up workflows", "Basic inventory monitoring", "Timesheet validation and processing"]}	{"AI Invoice Processing","Automated Payment Reminders","Smart Appointment Scheduling","Customer Follow-up Automation","Inventory Monitoring","HR Compliance Checks","Mobile Access","Audit Trails","ROI Reporting","3-Tool Integration"}	50	\N	\N	t	t	\N	\N	Intermediate	t	f	{"Fully configured AI automation system","Integration setup with existing business tools","Mobile app access for monitoring and controls","Basic training session (2 hours)","User documentation and quick-start guide","Monthly performance reports with ROI analysis"}	DEVELOPMENT	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{"Professional Services",Retail,Healthcare,Hospitality}	t	SERVICE	\N	\N	1	{"Active business email system","Basic accounting software (QuickBooks, Xero, etc.)","Existing appointment/CRM system","Admin access to business tools for integration","Stable internet connection"}	\N	\N	0.00	0	monthly	2	{"Custom workflow development","Advanced predictive analytics","Integration with premium enterprise tools","24/7 priority support","White-label or reseller options"}	{"AI-powered invoice processing and payment reminders","Automated appointment scheduling system","Basic inventory tracking with low-stock alerts","Timesheet processing and basic HR compliance","Customer follow-up automation","Integration with up to 3 business tools","Mobile notifications and alerts","Basic audit trail and activity logging","Email and chat support during business hours","Monthly performance and ROI reports"}	499.00	12	months	\N	{"Small Businesses","Service Providers","Retail Stores"}	{AI/ML,"REST APIs","Cloud Infrastructure","Mobile Apps"}	\N	\N	\N
567f6139-585c-4a5d-90ad-089356a8fef1	AI Content Calendar Generator - SMB Plan	ai-content-calendar-generator-smb	Generate 3 months of branded content ideas using AI. Delivered as an editable Notion or Google Sheet with prompts, hashtags, and image ideas.	149.00	https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop	AVAILABLE	6d5a7d4f-de8c-4691-ba98-670b12b146ce	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:38.004	2025-09-11 07:47:38.004	\N	{"90-day content planner","Prompt generator included","Notion & Google Sheet export","Engagement theme library"}	999999	\N	\N	f	t	\N	\N	\N	f	f	\N	DIGITAL	\N	\N	\N	\N	ONE_TIME	\N	\N	\N	\N	\N	f	PRODUCT	\N	\N	1	\N	\N	\N	0.00	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
32325646-37c6-4f9b-986d-8ea557695f03	Autonomous Business Operations Agent - Advanced	autonomous-business-operations-agent-advanced	Comprehensive business automation for growing companies. The Advanced tier delivers predictive analytics, custom workflows, and enterprise-grade integrations. Achieve 25-35% operational efficiency gains with AI agents that learn and optimize your business processes autonomously.	499.00	https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop	AVAILABLE	785143d9-95cb-40c8-a661-37eec286d91d	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.927	2025-09-11 07:47:37.927	{"roi": {"paybackPeriod": "1.5-2 months", "errorReduction": "92%", "revenueIncrease": "8-15%", "costSavingsMonthly": "$1500-2500", "timeSavingsPerWeek": "15-25 hours"}, "analytics": ["Predictive demand forecasting", "Customer lifetime value analysis", "Process efficiency metrics", "Cost center analysis", "ROI tracking by automation type"], "integrations": ["All Core integrations plus:", "Salesforce CRM", "HubSpot Marketing", "Shopify/WooCommerce", "Slack/Microsoft Teams", "Zapier for extended connectivity", "Advanced accounting systems", "HR management platforms", "Business intelligence tools"], "automationCapabilities": ["All Core capabilities plus:", "Predictive inventory management", "Advanced customer journey automation", "Multi-channel communication sequences", "Financial reconciliation and reporting", "Advanced HR workflow automation", "Custom business rule processing", "Machine learning optimization"]}	{"All Core Features","Predictive Analytics","Custom Workflow Builder","Multi-channel Automation","Advanced HR Processing","Financial Reconciliation","Demand Forecasting","8-Tool Integration","Priority Support","Advanced Reporting"}	25	\N	\N	t	t	\N	\N	Expert	t	f	{"All Core tier deliverables","Custom workflow automation setup","Advanced analytics dashboard","Predictive models for inventory and demand","Enhanced mobile app with advanced controls","Comprehensive training program (8 hours)","Process optimization recommendations","Bi-weekly performance reviews and optimizations"}	DEVELOPMENT	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{E-commerce,Manufacturing,"Professional Services",Technology}	t	SERVICE	\N	\N	1	{"All Core tier prerequisites","Established business processes (6+ months operation)","Multiple business software systems in use","Dedicated IT contact or basic technical knowledge","Management commitment to process optimization"}	\N	\N	0.00	0	monthly	5	{"White-label or reseller licensing","On-premise deployment","Custom AI model training","24/7 phone support"}	{"All Core tier features included","Predictive inventory management with auto-ordering","Advanced customer segmentation and targeting","Custom workflow automation builder","Multi-channel communication automation","Advanced HR tasks and compliance monitoring","Financial transaction processing and reconciliation","Integration with up to 8 business tools","Advanced analytics dashboard with forecasting","Priority support with 4-hour response time","Bi-weekly optimization reviews","Custom reporting and KPI tracking"}	999.00	12	months	\N	{"Growing Businesses","Multi-location Companies",E-commerce}	{AI/ML,"Predictive Analytics","REST APIs","Cloud Infrastructure"}	\N	\N	\N
8cc424be-39e4-4385-b10c-78d18debcebc	Autonomous Business Operations Agent - Complete	autonomous-business-operations-agent-complete	Enterprise-grade autonomous business operations with unlimited customization. The Complete tier provides AI-driven strategic insights, unlimited integrations, and dedicated support. Achieve 30-45% operational efficiency gains with enterprise-level security and scalability for high-growth companies.	899.00	https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop	AVAILABLE	785143d9-95cb-40c8-a661-37eec286d91d	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.931	2025-09-11 07:47:37.931	{"roi": {"paybackPeriod": "1-1.5 months", "errorReduction": "96%", "revenueIncrease": "15-25%", "productivityGain": "30-45%", "costSavingsMonthly": "$3000-5000", "timeSavingsPerWeek": "25-40 hours"}, "enterprise": ["Multi-tenant architecture", "Advanced role-based access control", "Enterprise SSO integration", "Advanced audit and compliance reporting", "Custom SLA agreements", "Dedicated infrastructure resources"], "integrations": ["Unlimited integrations including:", "Enterprise ERP systems (SAP, Oracle)", "Advanced CRM platforms", "Business intelligence tools", "Custom APIs and databases", "Legacy system integration", "Cloud platform connectivity", "Third-party service integrations"], "automationCapabilities": ["All Advanced capabilities plus:", "Custom AI model development", "Strategic business intelligence", "Multi-location coordination", "Advanced compliance automation", "Custom workflow orchestration", "Enterprise-grade security controls", "Unlimited process automation"]}	{"All Advanced Features","Unlimited Integrations","Custom AI Models","Strategic BI Insights","Multi-location Support","24/7 Priority Support","Dedicated Success Manager","API Access","White-label Options","Custom Development"}	10	\N	\N	t	t	\N	\N	Enterprise	t	f	{"All Advanced tier deliverables","Custom AI models trained on business data","Enterprise dashboard with executive reporting","Unlimited integration setup and maintenance","Strategic business intelligence platform","Comprehensive staff training program (20+ hours)","Custom mobile app development","Dedicated customer success manager","Weekly optimization and strategy reviews"}	DEVELOPMENT	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{Enterprise,Manufacturing,Healthcare,"Financial Services"}	t	SERVICE	\N	\N	1	{"All Advanced tier prerequisites","Enterprise-level business operations","Dedicated technical team or IT department","Multiple locations or complex business structure","Executive-level commitment to digital transformation"}	\N	\N	0.00	0	monthly	\N	{"On-site implementation (available as add-on)","Custom hardware procurement","Legal compliance consulting (process automation only)"}	{"All Advanced tier features included","Unlimited business tool integrations","Custom AI model training for your business","Strategic business intelligence and insights","Advanced compliance monitoring and reporting","Multi-location/multi-company support","API access for custom development","White-label options available","Dedicated customer success manager","24/7 priority support with 1-hour response","Weekly strategy and optimization sessions","Custom development hours (10 hours/month)","Advanced security features and audit logs"}	1999.00	12	months	\N	{Enterprise,"Multi-location Businesses","High-growth Companies"}	{"Custom AI/ML","Enterprise APIs","Cloud Infrastructure","BI Tools"}	\N	\N	\N
c70c3672-284d-42f5-906f-c941d7445795	Smart Workforce Management Platform - Team	smart-workforce-management-platform-team	Transform your team management with AI-powered workforce optimization. Our Smart Workforce Management Platform eliminates 67% of administrative pressure while boosting productivity. Perfect for growing teams of 10-50 employees, this comprehensive solution automates scheduling, streamlines onboarding, and provides real-time performance insights that help managers focus on strategic growth rather than routine tasks.	299.00	https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop	AVAILABLE	34e6035c-5dd2-4052-acf9-0d7130979cf4	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.933	2025-09-11 07:47:37.933	{"features": ["Smart Scheduling Optimization", "Automated Onboarding Workflows", "Performance Analytics Dashboard", "Time & Attendance Tracking", "Mobile Employee Self-Service", "Basic Compliance Tracking", "Email Notifications", "Monthly Reporting"], "integrations": 2, "storageLimit": "10GB", "supportLevel": "Business Hours", "employeeLimit": 50, "reportingFrequency": "Monthly"}	{"AI-Powered Smart Scheduling","Automated Employee Onboarding","Performance Analytics Dashboard","Time and Attendance Automation","Mobile Self-Service App","HR System Integrations","Monthly Analytics Reports","Compliance Documentation","Email & Chat Support"}	25	\N	\N	t	t	\N	\N	Intermediate	t	f	{"Fully configured workforce management system","Custom onboarding process workflows","Performance tracking dashboard setup","Mobile app deployment for your team","Integration with your existing HR systems","Training materials and user guides","Monthly analytics and insights reports"}	CONSULTATION	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{Retail,Healthcare,"Professional Services",Hospitality}	t	SERVICE	\N	\N	1	{"Active HR or payroll system for integration","Employee data for initial system setup","Management team availability for onboarding session"}	\N	\N	0.00	0	monthly	2	{"Advanced predictive analytics (available in higher tiers)","Custom integrations beyond included systems","Advanced reporting and dashboard customization","24/7 priority support","Advanced compliance modules","White-label options"}	{"AI-powered employee scheduling optimization for up to 50 employees","Automated onboarding workflows with customizable checklists","Performance tracking dashboard with productivity insights","Basic time and attendance automation","Mobile app for employee self-service","Integration with 2 popular HR/payroll systems","Email and chat support during business hours","Monthly workforce analytics reports","Basic compliance tracking and documentation"}	499.00	12	months	\N	{"Small Teams","Growing Businesses","Service Companies"}	{"AI Scheduling Engine","Mobile Apps","Cloud-based Platform","API Integrations"}	\N	\N	\N
3af36829-01c0-4f2e-8d00-c2567238dfbf	Smart Workforce Management Platform - Organization	smart-workforce-management-platform-organization	Scale your workforce management with advanced AI analytics and predictive insights. Designed for mid-size organizations of 51-200 employees, this tier reduces administrative burden by 67% while providing sophisticated workforce optimization. Features advanced scheduling algorithms, comprehensive performance tracking, and predictive staffing recommendations that help you stay ahead of demand.	599.00	https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop	AVAILABLE	34e6035c-5dd2-4052-acf9-0d7130979cf4	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.935	2025-09-11 07:47:37.935	{"features": ["Predictive Staffing Analytics", "Advanced Scheduling Optimization", "Comprehensive Skills Tracking", "Labor Cost Management", "Real-time Adjustment Notifications", "Custom Dashboard Configuration", "Advanced Compliance Auditing", "Weekly Performance Reports"], "integrations": 5, "storageLimit": "50GB", "supportLevel": "Priority with Account Manager", "employeeLimit": 200, "reportingFrequency": "Weekly"}	{"Predictive Staffing Analytics","Advanced AI Scheduling Engine","Comprehensive Skills & Development Tracking","Labor Cost Optimization","Real-time Scheduling Adjustments","Custom Performance Dashboards","Advanced Compliance & Audit Trails","Multi-system Integrations","Dedicated Account Manager","Weekly Optimization Reports"}	15	\N	\N	t	t	\N	\N	Advanced	t	f	{"Enterprise-grade workforce management platform","Advanced predictive analytics dashboard","Custom automated workflows and processes","Comprehensive mobile app deployment","Multi-system integration setup","Advanced reporting and analytics suite","Training program for managers and HR staff","Weekly optimization and insights reports"}	CONSULTATION	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{Manufacturing,"Healthcare Systems","Retail Chains","Professional Services"}	t	SERVICE	\N	\N	1	{"Existing HR infrastructure with at least 6 months of historical data","Dedicated IT contact for integration support","Management team commitment to change management process"}	\N	\N	0.00	0	monthly	5	{"White-label branding options","Advanced API access for custom development","Enterprise-level security features","Unlimited integrations","Custom machine learning model training"}	{"Advanced AI scheduling optimization for up to 200 employees","Predictive staffing analytics and demand forecasting","Comprehensive automated onboarding with skills tracking","Advanced performance analytics with trend analysis","Smart shift optimization and labor cost management","Integration with up to 5 HR/payroll/business systems","Priority support with dedicated account manager","Weekly workforce optimization reports","Advanced compliance tracking and audit trails","Custom dashboard configuration","Real-time scheduling adjustments and notifications"}	999.00	12	months	\N	{"Mid-size Companies","Growing Enterprises","Multi-location Businesses"}	{"Advanced AI Engine","Predictive Analytics","Multi-platform Integration","Real-time Processing"}	\N	\N	\N
c34d8bcc-f41f-4a29-8df7-d9f24e4fe688	One-Click Analytics Dashboard - Local Business	analytics-dashboard-local-business	Google Data Studio dashboard that connects to your analytics, Meta ads, and GMB profile. Instant performance visibility, no code required.	179.00	https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=800&h=600&fit=crop	AVAILABLE	bdc60eef-18e9-400b-9750-40e7890dbe1d	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:38.006	2025-09-11 07:47:38.006	\N	{"Preconnected analytics dashboard","GMB and Facebook modules","Conversion and traffic reports","White-label support"}	999999	\N	\N	f	t	\N	\N	\N	f	f	\N	DIGITAL	\N	\N	\N	\N	ONE_TIME	\N	\N	\N	\N	\N	f	PRODUCT	\N	\N	1	\N	\N	\N	0.00	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7d815fa4-bc77-498a-86d3-8a53d2c84375	Smart Workforce Management Platform - Enterprise	smart-workforce-management-platform-enterprise	Enterprise-grade workforce optimization for organizations with 200+ employees. This comprehensive solution eliminates administrative pressure while delivering advanced AI-driven insights that transform how you manage your workforce. Features unlimited employee capacity, white-label options, advanced security, and custom machine learning models trained specifically for your industry and business patterns.	1199.00	https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop	AVAILABLE	34e6035c-5dd2-4052-acf9-0d7130979cf4	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.937	2025-09-11 07:47:37.937	{"features": ["Custom AI Model Training", "White-label Platform Branding", "Unlimited Employee Capacity", "Advanced Security & SSO", "Real-time Optimization Engine", "Custom Compliance Modules", "Executive Strategic Dashboards", "Dedicated Technical Team", "Advanced ROI Analytics"], "integrations": "Unlimited", "storageLimit": "Unlimited", "supportLevel": "24/7 Dedicated Team", "employeeLimit": "Unlimited", "reportingFrequency": "Daily"}	{"Custom AI Model Training","White-label Platform Branding","Unlimited Employee Management","Enterprise Security & SSO","Real-time Workforce Optimization","Advanced Predictive Scenario Planning","Custom Compliance & Audit Modules","Executive Strategic Dashboards","24/7 Dedicated Support Team","Advanced ROI & Labor Analytics","Unlimited System Integrations","Custom API Development"}	5	\N	\N	t	t	\N	\N	Expert	t	f	{"White-labeled enterprise workforce management platform","Custom-trained AI models for your specific use cases","Comprehensive integration suite with unlimited connections","Advanced security implementation with SSO","Custom compliance modules and reporting","Executive-level analytics and strategic dashboards","Complete employee and manager training program","Daily optimization reports and strategic insights","Dedicated technical support team assignment"}	CONSULTATION	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{"Fortune 500","Healthcare Systems",Manufacturing,"Financial Services",Government}	t	SERVICE	\N	\N	1	{"Enterprise IT infrastructure and security approval process","Minimum 12 months of historical workforce data","Executive sponsorship and change management commitment","Dedicated technical contact for integration coordination"}	\N	\N	0.00	0	monthly	10	{"On-premise deployment (cloud-first architecture)","Hardware procurement and setup","Legal consultation for compliance interpretation"}	{"Unlimited employee capacity with enterprise-grade infrastructure","Custom AI model training specific to your industry and patterns","Advanced predictive analytics with scenario planning","White-label platform with your company branding","Unlimited system integrations with custom API development","24/7 priority support with dedicated technical team","Real-time workforce optimization and automated adjustments","Advanced security features including SSO and audit logging","Custom compliance modules for industry-specific requirements","Daily executive dashboards and strategic insights","Advanced labor analytics with ROI tracking","Dedicated implementation specialist and ongoing consultation"}	2499.00	24	months	\N	{"Large Enterprises","Multi-national Companies","Enterprise Organizations"}	{"Custom AI Models","Enterprise Security","Unlimited Integrations","White-label Platform"}	\N	\N	\N
bae6adc3-5ea6-4df8-92e5-e0b36044a10e	No-Code Marketing Automation Suite - Starter Plan	no-code-marketing-automation-starter	Transform your marketing with our intuitive drag-and-drop automation platform. Perfect for small businesses looking to automate their marketing workflows without any coding knowledge. Build sophisticated campaigns, nurture leads, and grow your revenue with AI-powered content generation and seamless integrations.	199.00	https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80	AVAILABLE	bdc60eef-18e9-400b-9750-40e7890dbe1d	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.939	2025-09-11 07:47:37.939	{"analytics": ["Campaign performance metrics", "Email open/click rates", "Lead conversion tracking", "Basic ROI reporting"], "campaigns": "Up to 10 active campaigns", "platforms": ["Email", "Facebook", "Instagram"], "aiFeatures": ["Email subject line optimization", "Basic content suggestions", "Send time optimization"], "automations": "Basic email sequences", "contactLimit": 5000, "integrations": ["Mailchimp", "Facebook Business", "Instagram Business", "Google Analytics", "Zapier (basic)"]}	{"Drag-and-Drop Builder","AI Content Generation","Email Automation","Social Media Posting","Lead Capture Forms","Basic Analytics","Template Library","A/B Testing","Mobile Responsive","Email Support"}	50	\N	\N	t	t	\N	\N	Beginner	t	f	{"Fully configured automation platform access","Custom campaign setup based on your business","Branded email templates","Lead capture forms integration","Analytics dashboard configuration","Training materials and video guides","Campaign performance reports (monthly)"}	DIGITAL	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{E-commerce,"Professional Services",Coaching,Consulting}	t	SERVICE	\N	\N	1	{"Active business website or landing pages","Basic understanding of your target audience","Email list or lead generation strategy","Access to social media business accounts","Clear marketing goals and KPIs"}	\N	\N	0.00	0	monthly	2	{"Advanced AI content personalization","Multi-channel campaign orchestration","Advanced lead nurturing workflows","Custom integrations beyond standard list","Priority support","Advanced analytics and reporting","Team collaboration features","API access","White-label options"}	{"Visual drag-and-drop campaign builder","AI-powered email content generation","Basic social media post automation (2 platforms)","Lead capture forms and landing pages","Email marketing automation (up to 5,000 contacts)","Basic lead scoring and segmentation","Essential analytics dashboard","Email and chat support","Onboarding training session (1 hour)","Pre-built campaign templates (10)","Basic A/B testing for emails"}	99.00	30	days	\N	{"Small Businesses",Solopreneurs,Startups}	{Cloud-based,"API Integrations",AI/ML,"Responsive Web"}	\N	\N	\N
3fafc35e-4579-4d79-9ab8-53d3279d71af	No-Code Marketing Automation Suite - Growth Plan	no-code-marketing-automation-growth	Accelerate your marketing with advanced automation workflows and multi-channel campaigns. Ideal for growing businesses ready to scale their marketing efforts with sophisticated lead nurturing, advanced personalization, and comprehensive analytics across all marketing channels.	399.00	https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80	AVAILABLE	bdc60eef-18e9-400b-9750-40e7890dbe1d	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.944	2025-09-11 07:47:37.944	{"analytics": ["Cross-channel attribution", "Customer journey mapping", "Revenue attribution tracking", "Advanced ROI calculations", "Cohort analysis", "Predictive analytics", "Custom reporting dashboards"], "campaigns": "Up to 50 active campaigns", "platforms": ["Email", "SMS", "Facebook", "Instagram", "LinkedIn", "Twitter", "Google Ads"], "aiFeatures": ["Dynamic content personalization", "Predictive send time optimization", "Automated content creation", "Smart audience segmentation", "Behavioral trigger optimization", "Performance prediction modeling"], "automations": "Advanced multi-step sequences with conditional logic", "contactLimit": 25000, "integrations": ["HubSpot", "Salesforce", "Mailchimp", "All major social platforms", "Google Analytics 4", "Google Ads", "Facebook Ads", "Shopify", "WooCommerce", "Zapier (premium)", "Webhooks"]}	{"Advanced Workflow Builder","Multi-Channel Automation","AI Personalization","Behavioral Triggers","Advanced Analytics","Team Collaboration","Custom Integrations","Priority Support","Revenue Attribution","Predictive Insights"}	25	\N	\N	t	t	\N	\N	Intermediate	t	f	{"Fully optimized automation platform with advanced features","Multi-channel campaign strategy and setup","Custom email templates and landing pages","Advanced lead nurturing workflow implementation","Comprehensive analytics dashboard setup","Team training materials and workshops","Monthly strategy review and optimization calls","Detailed performance reports with actionable insights"}	DIGITAL	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{E-commerce,SaaS,Technology,"Professional Services",Healthcare}	t	SERVICE	\N	\N	1	{"Established marketing processes","Clear buyer personas and customer journey mapping","Multiple marketing channels in use","CRM system or customer database","Marketing team or dedicated marketing person","Monthly marketing budget of $2,000+"}	\N	\N	0.00	0	monthly	5	{"Enterprise-level API access","White-label customization","Dedicated account management","Custom development work","On-premise deployment options","Advanced enterprise security features"}	{"Advanced visual workflow builder with conditional logic","AI-powered multi-channel content generation","Automated social media management (5 platforms)","Advanced email marketing automation (up to 25,000 contacts)","Smart lead scoring with behavioral triggers","Dynamic content personalization","Multi-channel campaign orchestration","Advanced analytics and ROI tracking","Priority email and phone support","Custom onboarding and strategy session (2 hours)","Premium campaign templates (50+)","Advanced A/B testing and optimization","Team collaboration features (up to 5 users)","Custom integrations setup"}	199.00	90	days	\N	{"Growing Businesses","Marketing Teams",E-commerce,"SaaS Companies"}	{Cloud-native,"Advanced APIs","Machine Learning","Real-time Analytics"}	\N	\N	\N
e85bab25-d870-4b57-8fa3-f8c6a02f79e3	No-Code Marketing Automation Suite - Scale Plan	no-code-marketing-automation-scale	Enterprise-grade marketing automation for scaling businesses. Unleash the full power of AI-driven marketing with unlimited contacts, advanced enterprise features, dedicated support, and white-label options. Perfect for agencies and large organizations managing complex multi-brand campaigns.	799.00	https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80	AVAILABLE	bdc60eef-18e9-400b-9750-40e7890dbe1d	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.946	2025-09-11 07:47:37.946	{"analytics": ["Enterprise data warehouse integration", "Custom KPI tracking", "Advanced attribution modeling", "Real-time dashboard customization", "Predictive forecasting", "Customer journey analytics", "Multi-touch attribution", "Executive reporting suites", "API-driven reporting"], "campaigns": "Unlimited active campaigns", "platforms": ["All major platforms", "Custom integrations", "API-first approach"], "aiFeatures": ["Custom machine learning models", "Predictive customer lifetime value", "Advanced churn prediction", "Automated campaign optimization", "Real-time personalization engine", "Dynamic pricing optimization", "Intelligent lead scoring", "Automated content generation at scale"], "automations": "Enterprise-grade automation with unlimited complexity", "contactLimit": "Unlimited", "integrations": ["Salesforce Enterprise", "HubSpot Enterprise", "Microsoft Dynamics", "SAP", "Oracle", "Custom CRM systems", "All social media platforms", "All major ad platforms", "E-commerce platforms", "Custom APIs", "Enterprise webhooks", "Real-time data feeds"]}	{"Enterprise Automation","White-Label Platform","Unlimited Contacts","Dedicated Support","Custom AI Models","Advanced Security","Multi-Brand Management","Enterprise Integrations","Custom Development","Strategic Consulting"}	10	\N	\N	t	t	\N	\N	Expert	t	f	{"Fully customized enterprise automation platform","Multi-brand campaign architecture and implementation","Advanced AI model training for your specific business","Custom dashboard and reporting suite","Comprehensive team training and certification","Enterprise integration with all business systems","White-label setup and customization","Dedicated account management and strategic guidance","Monthly performance optimization reviews","Custom API endpoints and webhooks","Advanced security audit and compliance setup"}	DIGITAL	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{Enterprise,Agency,E-commerce,SaaS,Healthcare,"Financial Services"}	t	SERVICE	\N	\N	1	{"Established enterprise marketing operations","Dedicated marketing team (3+ members)","Complex customer journey requirements","Multiple brands or business units","Advanced compliance or security requirements","Monthly marketing budget of $10,000+","Integration with enterprise systems (CRM, ERP, etc.)"}	\N	\N	0.00	0	monthly	10	{"On-premise deployment (cloud-only)","Custom software development beyond platform scope","Third-party licensing fees","Hardware or infrastructure costs"}	{"Enterprise workflow builder with advanced automation logic","AI-powered omnichannel campaign orchestration","Unlimited contact management and segmentation","Advanced predictive analytics and machine learning","White-label platform customization","Dedicated account manager and priority support","Custom API development and integrations","Advanced team management (unlimited users)","Multi-brand and multi-account management","Enterprise security and compliance features","Custom training and certification programs","Quarterly business reviews and strategy optimization","Advanced A/B and multivariate testing","Real-time collaboration and approval workflows","Custom reporting and dashboard development"}	499.00	365	days	\N	{Enterprise,"Marketing Agencies","Large Organizations","Multi-Brand Companies"}	{"Enterprise Cloud","Custom APIs","Advanced ML/AI","Enterprise Security"}	\N	\N	\N
187182ef-cb45-45dd-ab62-584b82207ba7	Employee Onboarding Automation Template	employee-onboarding-automation-template	Automate your hiring and onboarding using ready-to-deploy Google Workspace and Zapier bundles. Includes task flows, docs, and emails.	149.00	https://images.unsplash.com/photo-1573496782432-35e4ceba66a5?w=800&h=600&fit=crop	AVAILABLE	34e6035c-5dd2-4052-acf9-0d7130979cf4	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:38.008	2025-09-11 07:47:38.008	\N	{"Zapier workflows","Editable onboarding docs","Automated email flows","Structured folder templates"}	999999	\N	\N	f	t	\N	\N	\N	f	f	\N	DIGITAL	\N	\N	\N	\N	ONE_TIME	\N	\N	\N	\N	\N	f	PRODUCT	\N	\N	1	\N	\N	\N	0.00	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7df93433-8831-41bd-9b7e-9e6e18b11a91	Hybrid AI Security & Compliance Platform - Secure Tier	hybrid-ai-security-compliance-secure	Entry-level hybrid AI security platform combining on-device AI processing for sensitive data with cloud-based analytics. Perfect for small to medium businesses looking to enhance their security posture while maintaining data privacy. Includes essential security monitoring, automated threat detection, and compliance reporting tools.	399.00	https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80	AVAILABLE	66c95a59-650a-41a7-9a0c-c9c1c6327e7e	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.948	2025-09-11 07:47:37.948	{"support": "8x5 support", "reporting": "Monthly compliance reports", "deployment": "Hybrid (On-premise + Cloud)", "aiCapabilities": ["Basic anomaly detection", "Automated security alerts", "Simple risk assessment"], "dataProcessing": "On-device for sensitive data, cloud for analytics", "securityFeatures": ["End-to-end encryption", "Basic threat monitoring", "Automated backup", "Access controls"], "supportedCompliance": ["GDPR Basic", "ISO 27001 Foundation"]}	{"On-Device AI Processing","Cloud Analytics Integration","Basic Threat Detection","Automated Compliance Monitoring","End-to-End Encryption","Multi-Factor Authentication","Monthly Security Reports","8x5 Technical Support","Basic Data Governance","Simple Risk Assessment"}	10	\N	\N	t	t	\N	\N	Intermediate	t	f	{"Deployed hybrid AI security platform","Security configuration documentation","User training materials and sessions","Monthly compliance and security reports","Incident response playbook","System monitoring dashboard access"}	DEVELOPMENT	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{Technology,Healthcare,Finance,"Professional Services"}	t	SERVICE	\N	\N	1	{"Basic IT infrastructure assessment","Network security requirements documentation","Data classification and sensitivity mapping","Stakeholder identification for security training"}	\N	\N	0.00	0	monthly	2	{"Custom compliance framework development","Advanced threat hunting services","24/7 monitoring and support","Penetration testing services","Custom integration development"}	{"Initial security assessment and setup","On-device AI deployment for sensitive data processing","Cloud integration for advanced analytics","Basic threat monitoring and alerting","Automated compliance reporting (GDPR, ISO 27001 basics)","End-to-end encryption implementation","Multi-factor authentication setup","Monthly security and compliance reports","8x5 technical support","Basic incident response procedures"}	799.00	12	months	\N	{SMBs,"Growing Companies","Security-Conscious Organizations"}	{AI/ML,Encryption,"Cloud Security",Monitoring}	\N	\N	\N
d30fef11-ba0f-4247-86d8-bd539162bfa3	Hybrid AI Security & Compliance Platform - Guardian Tier	hybrid-ai-security-compliance-guardian	Advanced hybrid AI security platform with comprehensive threat detection, automated compliance monitoring, and enhanced data governance. Ideal for medium to large enterprises requiring robust security controls, detailed compliance reporting, and advanced AI-driven security analytics.	799.00	https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80	AVAILABLE	66c95a59-650a-41a7-9a0c-c9c1c6327e7e	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.951	2025-09-11 07:47:37.951	{"support": "24x7 support with dedicated security analyst", "reporting": "Weekly detailed reports + real-time dashboards", "deployment": "Advanced Hybrid (Multi-site + Multi-cloud)", "aiCapabilities": ["Advanced anomaly detection", "Behavioral analytics", "Predictive threat modeling", "Automated risk assessment"], "dataProcessing": "Intelligent data routing with advanced on-device AI", "securityFeatures": ["Advanced threat hunting", "Real-time monitoring", "Automated incident response", "Advanced access controls", "Security orchestration"], "supportedCompliance": ["GDPR", "HIPAA", "SOX", "ISO 27001", "NIST"]}	{"Advanced AI Threat Detection","Multi-Cloud Security Orchestration","Automated Incident Response","Advanced Data Governance","Real-Time Compliance Monitoring","Behavioral Analytics","Predictive Threat Modeling","24x7 Security Operations Center","Advanced Access Controls","Security Audit Trails","Automated Risk Assessment","Integration with Existing Security Tools"}	5	\N	\N	t	t	\N	\N	Expert	t	f	{"Enterprise-grade hybrid AI security platform","Advanced security configuration and policies","Comprehensive security and compliance documentation","Weekly detailed reports and real-time dashboards","Advanced incident response procedures","Security orchestration playbooks","Integration documentation for existing tools","Advanced user training and certification"}	DEVELOPMENT	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{Healthcare,Finance,Government,Technology,Manufacturing}	t	SERVICE	\N	\N	1	{"Current security infrastructure audit","Data flow mapping and classification","Existing security tool inventory","Compliance requirements documentation","Network architecture documentation"}	\N	\N	0.00	0	monthly	3	{"Custom application development","Physical security assessments","Legal compliance consulting","Training for non-technical staff"}	{"Comprehensive security architecture assessment","Advanced on-device AI deployment with multi-site support","Multi-cloud security integration and orchestration","Advanced threat hunting and behavioral analytics","Automated compliance monitoring for multiple frameworks","Real-time security monitoring and alerting","Automated incident response and remediation","Weekly detailed security and compliance reports","24x7 security operations center support","Integration with existing security tools and SIEM","Advanced data governance and privacy controls","Predictive threat modeling and risk assessment"}	1499.00	12	months	\N	{Enterprises,"Healthcare Organizations","Financial Services"}	{"Advanced AI/ML","Security Orchestration",Multi-Cloud,"SIEM Integration"}	\N	\N	\N
50929f16-0164-4556-9d6c-416608a92a4d	Hybrid AI Security & Compliance Platform - Fortress Tier	hybrid-ai-security-compliance-fortress	Enterprise-grade hybrid AI security platform with maximum protection, advanced threat intelligence, custom compliance frameworks, and dedicated security team support. Designed for large enterprises, government agencies, and organizations with the highest security and compliance requirements.	1599.00	https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80	AVAILABLE	66c95a59-650a-41a7-9a0c-c9c1c6327e7e	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.953	2025-09-11 07:47:37.953	{"support": "Dedicated security team + on-site support options", "reporting": "Real-time dashboards + custom reporting + executive briefings", "deployment": "Custom Hybrid Architecture (Private Cloud + Edge + Multi-Cloud)", "aiCapabilities": ["Deep learning threat analysis", "Advanced behavioral modeling", "Threat intelligence correlation", "Custom AI model development"], "dataProcessing": "Zero-trust architecture with advanced AI processing", "securityFeatures": ["Advanced persistent threat (APT) detection", "Zero-trust architecture", "Quantum-ready encryption", "Custom security controls", "Advanced forensics"], "supportedCompliance": ["All major frameworks", "Custom compliance development"]}	{"Zero-Trust Security Architecture","Advanced Persistent Threat Detection","Custom AI Model Development","Quantum-Ready Encryption","Advanced Threat Intelligence","Custom Compliance Framework Development","Dedicated Security Team Support","Advanced Forensics and Investigation","Executive Security Briefings","Custom Integration Development","Advanced Behavioral Modeling","Threat Intelligence Correlation","On-Site Security Support","Custom Security Controls","Advanced Data Loss Prevention"}	2	\N	\N	t	t	\N	\N	Expert	t	f	{"Custom enterprise hybrid AI security platform","Zero-trust security architecture implementation","Custom AI models for organization-specific threats","Comprehensive security and compliance documentation","Real-time executive dashboards and reporting","Advanced incident response and forensics procedures","Custom compliance framework and controls","Executive security briefings and strategic recommendations","Advanced user training and security awareness programs","Custom integration documentation and support","Ongoing security optimization and enhancement plan"}	DEVELOPMENT	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{Government,Defense,"Critical Infrastructure","Large Healthcare","Major Financial Institutions"}	t	SERVICE	\N	\N	1	{"Executive security strategy assessment","Comprehensive risk analysis and threat modeling","Current security posture and maturity evaluation","Regulatory and compliance requirements analysis","Business continuity and disaster recovery planning","Stakeholder security awareness assessment"}	\N	\N	0.00	0	monthly	5	{"Hardware procurement and installation","Legal representation for compliance matters","Physical security infrastructure"}	{"Custom security architecture design and implementation","Zero-trust security model deployment","Advanced AI model development for specific threats","Custom compliance framework development","Advanced persistent threat (APT) detection and response","Quantum-ready encryption implementation","Dedicated security team assignment","Real-time threat intelligence correlation","Advanced forensics and investigation capabilities","Executive security briefings and strategic consulting","Custom integration development for proprietary systems","On-site security support and training","Advanced data loss prevention and governance","Custom security control development","24x7x365 premium support with guaranteed response times"}	2999.00	12	months	\N	{"Large Enterprises","Government Agencies","Critical Infrastructure"}	{"Custom AI/ML","Zero-Trust Architecture","Quantum Encryption","Advanced Analytics"}	\N	\N	\N
1b5077c4-6218-4970-8933-688ef8000cdd	Restaurant AI Suite - Startup	restaurant-ai-suite-startup	Essential AI-powered restaurant management tools designed for small restaurants and cafes. Streamline your operations with intelligent inventory tracking, basic menu optimization, and customer preference analysis to reduce waste and increase profitability.	399.00	https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop	AVAILABLE	20b473d2-fc34-408a-92a2-77c04fcdb5a6	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.955	2025-09-11 07:47:37.955	\N	\N	50	\N	\N	t	t	\N	\N	Intermediate	t	f	{"Restaurant AI dashboard access","Mobile app for managers","Initial system setup and configuration","Staff training materials","Monthly optimization reports"}	DIGITAL	\N	\N	\N	\N	MONTHLY	months	1	\N	\N	{"Food Service",Hospitality,"Quick Service"}	t	SERVICE	\N	\N	1	{"Compatible POS system (Square, Toast, or similar)","Reliable internet connection","Basic staff training participation"}	399.00	399.00	0.00	0	monthly	2	{"Advanced predictive analytics","Custom integrations beyond standard POS","Dedicated account manager","24/7 phone support"}	{"AI-powered inventory tracking system","Basic menu optimization recommendations","Customer preference analysis dashboard","Food waste reduction alerts","Monthly performance reports","Basic staff scheduling optimization","POS system integration support","Email support during business hours"}	\N	12	months	\N	{"Small Restaurants",Cafes,"Food Trucks"}	{AI/ML,"Cloud Analytics","POS Integration","Mobile App"}	\N	\N	\N
9c010512-d0d6-4fc3-a36b-0bdeadff0d15	Digital Product Funnel Kit - Gumroad & Shopify	digital-product-funnel-kit-gumroad-shopify	Launch-ready email + landing page funnel for selling digital products. Includes responsive HTML templates and optimized copy blocks.	119.00	https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=800&h=600&fit=crop	AVAILABLE	e1bffe20-968b-4ef8-9324-5db9fe4079d6	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:38.011	2025-09-11 07:47:38.011	\N	{"Funnel layout template","3-email sequence","Responsive landing page","Lead magnet formats"}	999999	\N	\N	f	t	\N	\N	\N	f	f	\N	DIGITAL	\N	\N	\N	\N	ONE_TIME	\N	\N	\N	\N	\N	f	PRODUCT	\N	\N	1	\N	\N	\N	0.00	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
01dd7d80-c83f-4e4c-90ec-df5a5154d6de	Restaurant AI Suite - Professional	restaurant-ai-suite-professional	Advanced AI restaurant management platform for growing establishments. Includes predictive analytics for demand forecasting, dynamic menu pricing, advanced staff optimization, and comprehensive customer journey analysis with loyalty program integration.	799.00	https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop	AVAILABLE	20b473d2-fc34-408a-92a2-77c04fcdb5a6	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.958	2025-09-11 07:47:37.958	\N	\N	25	\N	\N	t	t	\N	\N	Expert	t	f	{"All Startup tier deliverables","Advanced analytics dashboard","Predictive forecasting reports","Custom pricing strategy recommendations","Loyalty program optimization report","Bi-weekly performance reviews"}	DIGITAL	\N	\N	\N	\N	MONTHLY	months	1	\N	\N	{"Food Service",Hospitality,"Casual Dining"}	t	SERVICE	\N	\N	1	{"All Startup tier requirements","Historical sales data (minimum 3 months)","Customer loyalty program or willingness to implement"}	799.00	799.00	0.00	0	monthly	5	{"Custom AI model development","Multi-location enterprise features","White-label solutions"}	{"All Startup tier features","Predictive demand forecasting","Dynamic pricing recommendations","Advanced staff scheduling with labor cost optimization","Customer journey mapping and analytics","Loyalty program integration and optimization","Supply chain optimization recommendations","Real-time food safety monitoring","Competitor pricing analysis","Weekly strategy calls with AI specialist","Priority email and chat support"}	\N	12	months	\N	{"Mid-size Restaurants","Restaurant Groups","Fine Dining"}	{AI/ML,"Predictive Analytics","CRM Integration","Advanced Dashboards"}	\N	\N	\N
89f615ba-07c8-4c97-b343-f79eade0944f	Restaurant AI Suite - Enterprise	restaurant-ai-suite-enterprise	Complete enterprise-grade AI solution for restaurant chains and large establishments. Features custom AI models, multi-location management, franchise optimization, advanced compliance monitoring, and dedicated support team with 24/7 availability.	1499.00	https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop	AVAILABLE	20b473d2-fc34-408a-92a2-77c04fcdb5a6	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.96	2025-09-11 07:47:37.96	\N	\N	10	\N	\N	t	t	\N	\N	Expert	t	t	{"All Professional tier deliverables","Custom AI models tailored to business","Enterprise dashboard with role-based access","Comprehensive compliance reports","Custom integration documentation","Executive performance dashboards","Monthly strategic business reviews"}	DIGITAL	\N	\N	\N	\N	MONTHLY	months	1	\N	\N	{"Food Service",Hospitality,Enterprise}	t	SERVICE	\N	\N	1	{"All Professional tier requirements","Multiple locations or high-volume single location","Dedicated IT contact or team","Enterprise-level data security requirements"}	2999.00	1499.00	0.00	0	monthly	10	{"Hardware procurement and installation","Physical on-site consulting beyond initial setup"}	{"All Professional tier features","Custom AI model development for specific business needs","Multi-location dashboard and management","Franchise performance optimization","Advanced compliance monitoring and reporting","Supply chain risk assessment and mitigation","Employee performance analytics and optimization","Custom integrations with existing enterprise systems","White-label dashboard options","Dedicated customer success manager","24/7 phone and priority support","Monthly executive business reviews","Custom reporting and data exports"}	\N	12	months	\N	{"Restaurant Chains","Franchise Operations","Large Establishments"}	{"Custom AI/ML","Enterprise Integration","Multi-tenant Architecture","Advanced Security"}	\N	\N	\N
98732d2f-9a26-4684-b2ec-57ed6b7a91a7	Retail Intelligence Platform - Startup	retail-intelligence-platform-startup	Essential AI-driven retail analytics for small to medium retailers. Get intelligent insights into customer behavior, basic demand forecasting, and inventory optimization to maximize sales and reduce overstock situations.	399.00	https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop	AVAILABLE	20b473d2-fc34-408a-92a2-77c04fcdb5a6	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.962	2025-09-11 07:47:37.962	\N	\N	50	\N	\N	t	t	\N	\N	Intermediate	t	f	{"Retail intelligence dashboard","Mobile analytics app","Initial setup and data integration","Training materials and documentation","Monthly insights reports"}	DIGITAL	\N	\N	\N	\N	MONTHLY	months	1	\N	\N	{Retail,E-commerce,Fashion}	t	SERVICE	\N	\N	1	{"E-commerce platform or POS system","Minimum 3 months of sales history","Google Analytics or similar tracking"}	399.00	399.00	0.00	0	monthly	2	{"Advanced predictive modeling","Real-time pricing optimization","Custom integrations","Dedicated account management"}	{"Customer behavior analytics dashboard","Basic demand forecasting (30-day predictions)","Inventory optimization recommendations","Sales trend analysis and reporting","Product performance insights","Basic customer segmentation","E-commerce integration (Shopify, WooCommerce)","Monthly performance reports","Email support during business hours"}	\N	12	months	\N	{"Small Retailers","E-commerce Startups","Boutique Stores"}	{"AI Analytics","E-commerce Integration","Cloud Dashboards","Mobile App"}	\N	\N	\N
6e57fe76-1d20-4d7b-8b11-6b654e6775b4	Retail Intelligence Platform - Professional	retail-intelligence-platform-professional	Advanced retail AI platform with dynamic pricing, supply chain optimization, and advanced customer analytics. Perfect for growing retailers who need sophisticated insights to compete effectively and maximize profitability.	799.00	https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop	AVAILABLE	20b473d2-fc34-408a-92a2-77c04fcdb5a6	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.965	2025-09-11 07:47:37.965	\N	\N	25	\N	\N	t	t	\N	\N	Expert	t	f	{"All Startup tier deliverables","Advanced pricing dashboard","Supply chain optimization reports","Customer segmentation analysis","Competitive intelligence reports","Bi-weekly strategy recommendations"}	DIGITAL	\N	\N	\N	\N	MONTHLY	months	1	\N	\N	{Retail,E-commerce,Omnichannel}	t	SERVICE	\N	\N	1	{"All Startup tier requirements","Minimum 6 months of detailed sales data","Customer relationship management system"}	799.00	799.00	0.00	0	monthly	5	{"Custom AI model development","Multi-store enterprise features","Real-time inventory synchronization"}	{"All Startup tier features","Dynamic pricing optimization engine","Advanced demand forecasting (90-day predictions)","Supply chain optimization recommendations","Customer lifetime value analysis","Advanced market basket analysis","Competitor pricing monitoring","Seasonal trend prediction","A/B testing framework for pricing","Custom customer journey mapping","Weekly strategy consultations","Priority support via chat and email"}	\N	12	months	\N	{"Mid-size Retailers","Multi-channel Stores","Growing E-commerce"}	{"Advanced AI/ML","Pricing Algorithms","Supply Chain Analytics","CRM Integration"}	\N	\N	\N
455f311b-3901-4882-9be2-f4091394fb53	Brand Kit Generator - AI Logo + Style Guide	brand-kit-generator-ai-logo	Instant branding kit for new businesses. Generate a logo, color palette, and typography guide using AI.	99.00	https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop	AVAILABLE	0cb82981-7b30-4dd5-a48f-f066ff15c3ca	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:38.013	2025-09-11 07:47:38.013	\N	{"AI logo generation","Color palette + font pairs","Editable Figma + Canva files","PDF + digital exports"}	999999	\N	\N	f	t	\N	\N	\N	f	f	\N	DIGITAL	\N	\N	\N	\N	ONE_TIME	\N	\N	\N	\N	\N	f	PRODUCT	\N	\N	1	\N	\N	\N	0.00	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
9ee2d7f2-241c-452b-9000-104ef095bd98	Retail Intelligence Platform - Enterprise	retail-intelligence-platform-enterprise	Complete enterprise retail AI solution with custom models, multi-location management, advanced supply chain integration, and real-time optimization across all channels. Designed for large retailers and enterprise operations.	1499.00	https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop	AVAILABLE	20b473d2-fc34-408a-92a2-77c04fcdb5a6	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.967	2025-09-11 07:47:37.967	\N	\N	10	\N	\N	t	t	\N	\N	Expert	t	t	{"All Professional tier deliverables","Custom AI models for retail optimization","Enterprise command center dashboard","Advanced supply chain reports","Custom API documentation","Executive performance dashboards","Monthly strategic business reviews"}	DIGITAL	\N	\N	\N	\N	MONTHLY	months	1	\N	\N	{Retail,Enterprise,Omnichannel}	t	SERVICE	\N	\N	1	{"All Professional tier requirements","Multiple locations or high-volume operations","Enterprise IT infrastructure","Dedicated technical team for integration"}	3999.00	1499.00	0.00	0	monthly	10	{"Hardware procurement and installation","Physical inventory management services"}	{"All Professional tier features","Custom AI model development for specific retail vertical","Multi-location inventory synchronization","Advanced supply chain risk management","Real-time pricing optimization across all channels","Enterprise-grade customer data platform","Advanced fraud detection and prevention","Custom integrations with ERP and warehouse systems","White-label analytics platform options","Dedicated customer success team","24/7 technical support hotline","Monthly executive business reviews","Custom reporting and business intelligence"}	\N	12	months	\N	{"Large Retailers","Retail Chains","Enterprise E-commerce"}	{"Custom AI/ML","Enterprise Integration","Real-time Processing","Advanced Security"}	\N	\N	\N
8705a1cc-2daa-4fc4-a87a-97c95626afeb	Professional Services Automation - Startup	professional-services-automation-startup	Essential AI-powered tools for small professional service firms. Streamline client communications, automate basic project workflows, and optimize time tracking to increase billable efficiency and client satisfaction.	399.00	https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop	AVAILABLE	20b473d2-fc34-408a-92a2-77c04fcdb5a6	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.969	2025-09-11 07:47:37.969	\N	\N	50	\N	\N	t	t	\N	\N	Intermediate	t	f	{"Professional services automation dashboard","Mobile time tracking app","Automated workflow configurations","Client communication templates","Monthly efficiency reports"}	DIGITAL	\N	\N	\N	\N	MONTHLY	months	1	\N	\N	{"Legal Services",Consulting,"Professional Services"}	t	SERVICE	\N	\N	1	{"Existing CRM or client management system","Time tracking software or willingness to adopt","Email marketing platform"}	399.00	399.00	0.00	0	monthly	2	{"Custom workflow development","Advanced predictive analytics","Dedicated account management","Complex system integrations"}	{"AI-powered client communication management","Basic project workflow automation","Intelligent time tracking and categorization","Automated invoice generation","Client satisfaction survey automation","Basic resource allocation optimization","Email template library with AI suggestions","Monthly productivity reports","Integration with popular CRM systems","Email support during business hours"}	\N	12	months	\N	{"Small Law Firms","Consulting Startups","Freelance Professionals"}	{"AI Automation","CRM Integration","Time Tracking","Email Automation"}	\N	\N	\N
ab7d1f92-1b9d-4a29-baac-c9945f2afd3d	Professional Services Automation - Professional	professional-services-automation-professional	Advanced automation platform for growing professional service firms. Features predictive project planning, advanced client analytics, proposal automation, and comprehensive resource optimization with profitability insights.	799.00	https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop	AVAILABLE	20b473d2-fc34-408a-92a2-77c04fcdb5a6	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.972	2025-09-11 07:47:37.972	\N	\N	25	\N	\N	t	t	\N	\N	Expert	t	f	{"All Startup tier deliverables","Advanced analytics dashboard","Proposal automation system","Profitability analysis reports","Client retention strategies","Bi-weekly optimization recommendations"}	DIGITAL	\N	\N	\N	\N	MONTHLY	months	1	\N	\N	{"Legal Services",Consulting,Accounting}	t	SERVICE	\N	\N	1	{"All Startup tier requirements","Historical project and financial data","Accounting software integration capability"}	799.00	799.00	0.00	0	monthly	5	{"Custom AI model development","Multi-office enterprise features","White-label solutions"}	{"All Startup tier features","Predictive project planning and timeline optimization","Advanced client analytics and profitability tracking","AI-powered proposal generation and optimization","Contract lifecycle management automation","Resource allocation with skill matching","Predictive billing and cash flow forecasting","Client churn prediction and retention strategies","Advanced reporting and business intelligence","Integration with accounting and legal software","Weekly strategy consultations","Priority support via chat and phone"}	\N	12	months	\N	{"Mid-size Law Firms","Consulting Agencies","Professional Service Companies"}	{"Advanced AI/ML","Predictive Analytics","Document Automation","Financial Integration"}	\N	\N	\N
71014f32-3ced-4b25-be26-16e3d0254977	Professional Services Automation - Enterprise	professional-services-automation-enterprise	Complete enterprise automation solution for large professional service organizations. Custom AI models, multi-office management, advanced compliance monitoring, and enterprise-grade integrations with dedicated support.	1499.00	https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop	AVAILABLE	20b473d2-fc34-408a-92a2-77c04fcdb5a6	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.974	2025-09-11 07:47:37.974	\N	\N	10	\N	\N	t	t	\N	\N	Expert	t	t	{"All Professional tier deliverables","Custom AI models for practice areas","Enterprise command dashboard","Compliance and risk reports","Custom integration documentation","Executive performance dashboards","Monthly strategic business reviews"}	DIGITAL	\N	\N	\N	\N	MONTHLY	months	1	\N	\N	{"Legal Services",Enterprise,Compliance}	t	SERVICE	\N	\N	1	{"All Professional tier requirements","Multiple offices or large single location","Enterprise IT infrastructure","Dedicated technical and compliance teams"}	2999.00	1499.00	0.00	0	monthly	10	{"Legal advice or consulting","Physical document digitization services"}	{"All Professional tier features","Custom AI models for specific practice areas","Multi-office resource optimization","Advanced compliance monitoring and reporting","Enterprise document management automation","Advanced conflict checking and risk management","Custom integrations with enterprise systems","Advanced security and audit trails","White-label client portal options","Dedicated customer success team","24/7 technical support hotline","Monthly executive business reviews","Custom reporting and business intelligence"}	\N	12	months	\N	{"Large Law Firms","Enterprise Consulting","Professional Service Networks"}	{"Custom AI/ML","Enterprise Integration","Advanced Security","Compliance Monitoring"}	\N	\N	\N
74de7679-ae6f-4d91-a07e-9f5d4c04096a	Construction Project Intelligence - Professional	construction-project-intelligence-professional	Advanced construction AI platform with predictive project analytics, advanced safety monitoring, supply chain optimization, and comprehensive risk management for growing construction companies.	799.00	https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop	AVAILABLE	20b473d2-fc34-408a-92a2-77c04fcdb5a6	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.986	2025-09-11 07:47:37.986	\N	\N	25	\N	\N	t	t	\N	\N	Expert	t	f	{"All Startup tier deliverables","Advanced project analytics dashboard","Safety and risk assessment reports","Supply chain optimization recommendations","Quality control monitoring system","Bi-weekly project optimization reviews"}	DIGITAL	\N	\N	\N	\N	MONTHLY	months	1	\N	\N	{Construction,Infrastructure,"Commercial Building"}	t	SERVICE	\N	\N	1	{"All Startup tier requirements","Historical project data (minimum 6 months)","Equipment and material tracking systems"}	799.00	799.00	0.00	0	monthly	5	{"Custom AI model development","Multi-site enterprise features","Physical equipment monitoring hardware"}	{"All Startup tier features","Predictive project completion analytics","Advanced safety incident prediction and prevention","Supply chain risk assessment and optimization","Equipment utilization optimization","Advanced cost estimation and budget forecasting","Quality control automation and reporting","Permit and regulatory compliance tracking","Advanced subcontractor performance analytics","Change order impact analysis","Weekly project strategy consultations","Priority support via chat and phone"}	\N	12	months	\N	{"Mid-size Construction Companies","Commercial Builders","Infrastructure Contractors"}	{"Advanced AI/ML","Predictive Analytics","Risk Management","Quality Control"}	\N	\N	\N
ee5814f2-eed2-41e5-be9c-fa2dbf8540cf	Healthcare Practice Management - Startup	healthcare-practice-management-startup	Essential AI-powered practice management for small healthcare providers. Optimize appointment scheduling, automate patient communications, and streamline basic administrative tasks while maintaining HIPAA compliance.	399.00	https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop	AVAILABLE	20b473d2-fc34-408a-92a2-77c04fcdb5a6	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.976	2025-09-11 07:47:37.976	\N	\N	50	\N	\N	t	t	\N	\N	Intermediate	t	f	{"Healthcare practice dashboard","Mobile practice management app","Automated scheduling system","Patient communication templates","Monthly practice efficiency reports"}	DIGITAL	\N	\N	\N	\N	MONTHLY	months	1	\N	\N	{Healthcare,"Medical Practice",Telehealth}	t	SERVICE	\N	\N	1	{"Existing EMR system","HIPAA compliance infrastructure","Patient management system"}	399.00	399.00	0.00	0	monthly	2	{"Custom clinical decision support","Advanced predictive analytics","Telemedicine platform integration","Custom EMR integrations"}	{"AI-optimized appointment scheduling","Automated patient reminder system","Basic patient communication automation","HIPAA-compliant document management","Insurance verification workflow automation","No-show prediction and prevention","Basic patient satisfaction tracking","Simple billing optimization","EMR integration (major platforms)","Email support during business hours"}	\N	12	months	\N	{"Small Clinics","Individual Practitioners","Specialty Practices"}	{"Healthcare AI","EMR Integration","HIPAA Compliance","Scheduling Automation"}	\N	\N	\N
99629e56-37b5-45dc-8dc2-b3dd172d373b	Healthcare Practice Management - Professional	healthcare-practice-management-professional	Advanced healthcare AI platform with predictive analytics, clinical decision support, and comprehensive practice optimization. Perfect for growing practices that need sophisticated insights and automation.	799.00	https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop	AVAILABLE	20b473d2-fc34-408a-92a2-77c04fcdb5a6	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.979	2025-09-11 07:47:37.979	\N	\N	25	\N	\N	t	t	\N	\N	Expert	t	f	{"All Startup tier deliverables","Advanced clinical analytics dashboard","Population health reports","Revenue optimization recommendations","Compliance monitoring reports","Bi-weekly practice optimization reviews"}	DIGITAL	\N	\N	\N	\N	MONTHLY	months	1	\N	\N	{Healthcare,"Medical Practice","Population Health"}	t	SERVICE	\N	\N	1	{"All Startup tier requirements","Historical patient data (minimum 6 months)","Quality improvement program participation"}	799.00	799.00	0.00	0	monthly	5	{"Custom clinical AI model development","Multi-location enterprise features","Direct patient care services"}	{"All Startup tier features","Predictive patient health analytics","Advanced clinical decision support tools","Automated insurance claim processing","Revenue cycle optimization","Patient risk stratification","Advanced appointment optimization with provider matching","Telemedicine platform integration","Population health management tools","Compliance monitoring and reporting","Weekly clinical and business consultations","Priority support via secure channels"}	\N	12	months	\N	{"Multi-provider Practices","Specialty Clinics","Healthcare Groups"}	{"Clinical AI/ML","Predictive Analytics","Revenue Cycle Management","Population Health"}	\N	\N	\N
63951998-982b-46af-b6b6-626545b125ef	Healthcare Practice Management - Enterprise	healthcare-practice-management-enterprise	Complete enterprise healthcare AI solution with custom clinical models, multi-site management, advanced regulatory compliance, and integrated quality improvement programs for large healthcare organizations.	1499.00	https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop	AVAILABLE	20b473d2-fc34-408a-92a2-77c04fcdb5a6	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.981	2025-09-11 07:47:37.981	\N	\N	10	\N	\N	t	t	\N	\N	Expert	t	t	{"All Professional tier deliverables","Custom clinical AI models","Enterprise clinical command center","Advanced compliance and quality reports","Custom integration documentation","Executive clinical dashboards","Monthly strategic clinical reviews"}	DIGITAL	\N	\N	\N	\N	MONTHLY	months	1	\N	\N	{Healthcare,Enterprise,"Healthcare Networks"}	t	SERVICE	\N	\N	1	{"All Professional tier requirements","Multiple locations or large healthcare system","Enterprise healthcare IT infrastructure","Dedicated clinical and technical teams"}	3999.00	1499.00	0.00	0	monthly	10	{"Medical device integration hardware","Direct clinical care services","Regulatory consulting services"}	{"All Professional tier features","Custom clinical AI models for specialty areas","Multi-site practice network management","Advanced regulatory compliance automation","Integrated quality improvement programs","Advanced clinical research tools","Enterprise EMR and HIE integrations","Advanced security and audit capabilities","White-label patient portal options","Dedicated clinical and technical success teams","24/7 clinical and technical support","Monthly executive and clinical reviews","Custom clinical research and analytics"}	\N	12	months	\N	{"Healthcare Systems","Hospital Networks","Large Medical Groups"}	{"Custom Clinical AI","Enterprise Integration","Advanced Compliance","Quality Management"}	\N	\N	\N
44070a21-9116-457c-8e3c-0e4e1359282f	Construction Project Intelligence - Startup	construction-project-intelligence-startup	Essential AI-powered project management for small construction companies. Optimize project timelines, track resources and costs, manage basic safety compliance, and streamline subcontractor coordination.	399.00	https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop	AVAILABLE	20b473d2-fc34-408a-92a2-77c04fcdb5a6	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.983	2025-09-11 07:47:37.983	\N	\N	50	\N	\N	t	t	\N	\N	Intermediate	t	f	{"Construction intelligence dashboard","Mobile project management app","Automated scheduling system","Cost tracking and reporting tools","Monthly project efficiency reports"}	DIGITAL	\N	\N	\N	\N	MONTHLY	months	1	\N	\N	{Construction,Contracting,"Project Management"}	t	SERVICE	\N	\N	1	{"Project management software or willingness to adopt","Basic project documentation processes","Subcontractor contact database"}	399.00	399.00	0.00	0	monthly	2	{"Advanced predictive modeling","Custom safety training programs","Real-time equipment monitoring","Advanced analytics dashboards"}	{"AI-optimized project scheduling and timeline management","Resource allocation and cost tracking","Basic safety compliance monitoring","Subcontractor management and scheduling","Material ordering optimization","Weather impact analysis and adjustments","Basic progress reporting and documentation","Budget variance alerts and recommendations","Integration with popular project management tools","Email support during business hours"}	\N	12	months	\N	{"Small Contractors","Specialty Trade Companies","Residential Builders"}	{"Project AI","Resource Optimization","Scheduling Algorithms","Mobile Apps"}	\N	\N	\N
64f02bc0-0e0a-4f7c-98bb-7cb5f6e99bbc	AI Auto-Reply Chatbot for Facebook & IG	ai-auto-reply-chatbot-fb-ig	Plug-and-play chatbot setup for automating responses to common questions on Facebook and Instagram DMs. Includes keyword triggers, appointment booking integration, and preloaded conversation flows.	199.00	https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=800&h=600&fit=crop	AVAILABLE	66c95a59-650a-41a7-9a0c-c9c1c6327e7e	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.999	2025-09-11 07:47:37.999	\N	{"Ready-to-import JSON flow for Meta platforms","Appointment scheduling integrations","FAQ auto-responder logic","Multi-language support"}	999999	\N	\N	f	t	\N	\N	\N	f	f	\N	DIGITAL	\N	\N	\N	\N	ONE_TIME	\N	\N	\N	\N	\N	f	PRODUCT	\N	\N	1	\N	\N	\N	0.00	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
07a7208b-7e21-4e92-ac5e-78f4e71b54f0	Construction Project Intelligence - Enterprise	construction-project-intelligence-enterprise	Complete enterprise construction AI solution with custom models, multi-project portfolio management, advanced regulatory compliance, and integrated safety management for large construction organizations.	1499.00	https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop	AVAILABLE	20b473d2-fc34-408a-92a2-77c04fcdb5a6	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.988	2025-09-11 07:47:37.988	\N	\N	10	\N	\N	t	t	\N	\N	Expert	t	t	{"All Professional tier deliverables","Custom AI models for construction verticals","Enterprise project command center","Advanced compliance and safety reports","Custom integration documentation","Executive project dashboards","Monthly strategic business reviews"}	DIGITAL	\N	\N	\N	\N	MONTHLY	months	1	\N	\N	{Construction,Engineering,Infrastructure}	t	SERVICE	\N	\N	1	{"All Professional tier requirements","Multiple concurrent projects or large-scale operations","Enterprise IT infrastructure","Dedicated project management and technical teams"}	3999.00	1499.00	0.00	0	monthly	10	{"Physical equipment procurement","On-site safety training services","Regulatory consulting services"}	{"All Professional tier features","Custom AI models for specific construction verticals","Multi-project portfolio optimization","Advanced regulatory compliance automation","Integrated safety management systems","Advanced equipment and IoT sensor integration","Enterprise resource planning integration","Advanced risk modeling and scenario planning","White-label client portal options","Dedicated customer success team","24/7 technical support hotline","Monthly executive business reviews","Custom reporting and business intelligence"}	\N	12	months	\N	{"Large Construction Companies","Engineering Firms","Infrastructure Developers"}	{"Custom AI/ML","Enterprise Integration","IoT Integration","Advanced Compliance"}	\N	\N	\N
8d597bf3-471d-451a-89a3-1ef1ae78b97f	AI Customer Support & Sales System - Startup	ai-customer-support-sales-system-startup	Voice-first AI customer support system designed for small businesses. Features intelligent conversation handling, basic intent recognition for sales vs support, and seamless web chat integration with business hours coverage.	399.00	https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop	AVAILABLE	20b473d2-fc34-408a-92a2-77c04fcdb5a6	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.99	2025-09-11 07:47:37.99	\N	\N	25	\N	\N	t	t	\N	\N	Intermediate	t	f	{"AI-powered voice response system","Embeddable web chat widget","Analytics dashboard access","CRM integration setup","Standard configuration documentation"}	DIGITAL	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{"Professional Services",E-commerce,"Local Businesses"}	t	SERVICE	\N	\N	1	{"Existing phone system or willingness to adopt Twilio","Website for chat widget integration","Basic CRM system (HubSpot, Salesforce, etc.)","Internet connection for cloud services"}	\N	\N	0.00	0	monthly	2	{"24/7 availability","SMS and social media channels","Advanced analytics","Custom AI training","Human agent handoff capabilities"}	{"Voice-first AI customer support (primary channel)","Basic intent recognition (sales vs support)","Web chat widget integration","Up to 500 conversations per month","Business hours AI coverage (9AM-6PM)","Basic analytics dashboard","Email support integration","Single CRM platform integration","Standard response templates","Email support during business hours"}	\N	12	months	\N	{"Small Businesses",Startups,"Solo Entrepreneurs"}	{AI/ML,"Voice AI","Twilio Voice","Web Chat"}	\N	\N	\N
d6336b1f-145a-4129-9c0b-2cdfc052d06b	AI Customer Support & Sales System - Professional	ai-customer-support-sales-system-professional	Advanced multi-channel AI customer support platform for growing businesses. Features 24/7 availability, SMS/WhatsApp integration, advanced analytics, human agent handoff, and comprehensive business system integrations.	799.00	https://images.unsplash.com/photo-1553484771-cc0d9b8c2b33?w=800&h=600&fit=crop	AVAILABLE	20b473d2-fc34-408a-92a2-77c04fcdb5a6	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.992	2025-09-11 07:47:37.992	\N	\N	20	\N	\N	t	t	\N	\N	Expert	t	f	{"Multi-channel AI communication platform","Advanced analytics dashboard","Human agent handoff system","Call recording and transcription tools","Multiple CRM integrations setup","Comprehensive training and documentation"}	DIGITAL	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{E-commerce,SaaS,"Professional Services",Healthcare}	t	SERVICE	\N	\N	1	{"Existing business communication infrastructure","Multiple customer service channels in use","CRM system with API access","Human support agents for escalation"}	\N	\N	0.00	0	monthly	5	{"Social media channel integration","Custom AI model training","White-label branding options","Dedicated account management"}	{"All Startup tier features","24/7 AI availability and monitoring","Advanced intent classification and routing","SMS and WhatsApp integration via Twilio","Email automation and threading","Up to 2,000 conversations per month","Advanced analytics and reporting dashboard","Multiple CRM platform integrations","Intelligent human agent handoff","Call recording and transcription","Conversation history and context preservation","Priority support via chat and phone"}	499.00	12	months	\N	{"Mid-size Companies","Growing Businesses","Multi-channel Operations"}	{"Advanced AI/ML","Multi-Channel APIs","Real-time Analytics","CRM Integrations"}	\N	\N	\N
b9b610a1-256c-48f6-8b72-4687c713b3c0	AI Customer Support & Sales System - Enterprise	ai-customer-support-sales-system-enterprise	Complete enterprise-grade AI customer support and sales platform with unlimited conversations, social media integration, custom AI training, white-label options, advanced security, and dedicated account management for large organizations.	1499.00	https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop	AVAILABLE	20b473d2-fc34-408a-92a2-77c04fcdb5a6	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.994	2025-09-11 07:47:37.994	\N	\N	5	\N	\N	t	t	\N	\N	Expert	t	f	{"Full enterprise AI platform deployment","Custom AI model trained on your data","White-label branded interfaces","Advanced security configuration","Custom integrations and workflows","Executive dashboards and reporting","Comprehensive training program","Dedicated account management"}	DIGITAL	\N	\N	\N	\N	MONTHLY	month	1	\N	\N	{Enterprise,"Financial Services",Healthcare,Technology,Government}	t	SERVICE	\N	\N	1	{"Enterprise-level infrastructure","Dedicated IT support team","Multiple business locations or brands","Advanced security and compliance requirements"}	\N	\N	0.00	0	monthly	10	{"Physical hardware or equipment","On-site installation services","Third-party licensing costs"}	{"All Professional tier features","Unlimited conversations and channels","Facebook Messenger and Instagram DM integration","Custom AI model training for your industry","White-label branding and customization","Advanced security and compliance features","Multi-location and multi-brand support","Priority technical support with dedicated account manager","Custom integration development","Advanced workflow automation","Executive reporting and business intelligence","API access for custom development","24/7 dedicated support hotline"}	2999.00	12	months	\N	{"Large Enterprises","Multi-location Businesses","Enterprise IT Teams"}	{"Custom AI/ML","Enterprise APIs","Advanced Security","Multi-tenant Architecture"}	\N	\N	\N
b2a51567-3028-4e5d-bf7a-80a9ddec4d35	Local SEO Power Pack - Starter Edition	local-seo-power-pack-starter	A comprehensive toolkit for small businesses to improve their Google Business ranking, local map visibility, and search presence. Includes templates, audit checklists, and SEO-optimized content blocks tailored to your industry.	129.00	https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop	AVAILABLE	bdc60eef-18e9-400b-9750-40e7890dbe1d	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:37.996	2025-09-11 07:47:37.996	\N	{"Google Business Profile audit checklist","Citations & backlinks tracker","Local keyword research template","Pre-written industry-specific meta descriptions"}	999999	\N	\N	f	t	\N	\N	\N	f	f	\N	DIGITAL	\N	\N	\N	\N	ONE_TIME	\N	\N	\N	\N	\N	f	PRODUCT	\N	\N	1	\N	\N	\N	0.00	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
f77b0e85-f590-4954-b326-8e6c0d437ea9	SOP Builder: Small Biz Ops Manual Generator	sop-builder-small-biz-ops-manual	Create professional SOPs using AI-powered templates. Export clean PDF manuals or Notion handbooks for training and compliance.	179.00	https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=600&fit=crop	AVAILABLE	340dc459-5a2a-488f-8ea2-963545b605aa	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	2025-09-11 07:47:38.015	2025-09-11 07:47:38.015	\N	{"SOP generator prompt set","Notion template kit","PDF export styles","50+ SOP examples"}	999999	\N	\N	f	t	\N	\N	\N	f	f	\N	DIGITAL	\N	\N	\N	\N	ONE_TIME	\N	\N	\N	\N	\N	f	PRODUCT	\N	\N	1	\N	\N	\N	0.00	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: newsletter_campaigns; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.newsletter_campaigns (id, name, subject, preheader, content, "htmlContent", status, "scheduledAt", "sentAt", "segmentCriteria", "templateId", "totalRecipients", "totalSent", "totalDelivered", "totalOpened", "totalClicked", "totalUnsubscribed", "totalBounced", "totalComplained", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: newsletter_emails; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.newsletter_emails (id, "campaignId", "subscriberId", subject, content, "htmlContent", status, "sentAt", "deliveredAt", "openedAt", "clickedAt", "bouncedAt", "complainedAt", "openCount", "clickCount", "errorMessage", "retryCount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: newsletter_subscribers; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.newsletter_subscribers (id, email, "firstName", "lastName", status, "consentGiven", "consentDate", "ipAddress", "userAgent", source, "confirmationToken", "confirmedAt", "lastEmailSent", "lastOpenedEmail", "lastClickedEmail", "totalEmailsSent", "totalEmailsOpened", "totalEmailsClicked", "unsubscribeToken", "unsubscribeReason", "unsubscribedAt", "createdAt", "updatedAt") FROM stdin;
10b3fe55-6e34-4695-8748-d8b4bad5409c	gregory.a.starr@gmail.com	\N	\N	ACTIVE	t	2025-11-15 23:35:22.457	::1	node	footer	\N	2025-11-15 23:39:23.07	\N	\N	\N	0	0	0	7542620f9a8932b256ed3d78e72f7da879de02ab0595bba1ad9a8d07cb61a8f8	\N	\N	2025-11-15 23:35:22.458	2025-11-15 23:39:23.07
d6dfe586-c427-4223-9f15-60c987d46528	ceo@astralisone.com	Gregory	A Starr	PENDING	t	2025-11-15 23:40:57.64	::1	node	modal	7bdaa0a5aa70a431ab81c7b6623af9c47792131be9c133fc8b40f6ec27a152ec	\N	\N	\N	\N	0	0	0	089a6c09651fb4064fe246e405d8b86309401e1bc28820d62bb1bc4ddf25145f	\N	\N	2025-11-15 23:40:57.64	2025-11-15 23:40:57.64
99d11035-f17a-4b95-9459-b196d809ee97	gregory.a.starr+testing@gmail.com	Gregory	Starr	ACTIVE	t	2025-11-15 23:45:56.986	::1	node	modal	\N	2025-11-15 23:46:03.968	\N	\N	\N	0	0	0	7e2c42bc7d34a16f450dcbe31fa2e95a99cdb421a81affe9614cfdc3b1f63ccf	\N	\N	2025-11-15 23:45:56.987	2025-11-15 23:46:03.968
3b976f84-cd4e-47ac-a3cb-7014614535b4	test@example.com	\N	\N	PENDING	t	2025-11-15 23:48:53.732	::1	node	test	dc1a2deb184d8e228decf5a6b5077267855c819ad670fa881b36c2489c100c88	\N	\N	\N	\N	0	0	0	94dea491e960498d4742daa0307448dbace160ca8825f4635e79486671065bf4	\N	\N	2025-11-15 23:15:19.062	2025-11-15 23:48:53.732
e5240c4c-70d3-4389-853d-8b128ad3044b	freshtest@example.com	Fresh	Test	PENDING	t	2025-11-15 23:49:14.765	::1	node	test	b34b736cd317146ec5aa38fc1cb7aa1c374845ae27f37da8407131332ee0b441	\N	\N	\N	\N	0	0	0	6e40750cff76c59322d578a804aa9d94890d91a3bb61a5ed33b77a47613037fe	\N	\N	2025-11-15 23:49:14.766	2025-11-15 23:49:14.766
803c3d25-3670-4b7c-bb86-21f605363777	brandnew.test@example.com	Brand	New	ACTIVE	t	2025-11-15 23:50:06.826	::1	node	manual-test	\N	2025-11-15 23:50:20.168	\N	\N	\N	0	0	0	eb97012be265419f7a05e36450c18004ed9e813416bf91c798530b34b3a2f1bd	\N	\N	2025-11-15 23:50:06.826	2025-11-15 23:50:20.168
a8c145dc-faf8-4ea3-9370-949f28f1f147	second.test@example.com	Second	Test	PENDING	t	2025-11-15 23:50:35.566	::1	node	verification-test	654a13db10cedeea803af8caa551e515806b6d7d22a75504cc3eb0568b99fc16	\N	\N	\N	\N	0	0	0	bd7f451485b4cba33a0919cf65f8fe8d3d059960e37a68416901738b3ac763af	\N	\N	2025-11-15 23:50:35.566	2025-11-15 23:50:35.566
1c6aeb7d-bb69-4824-885c-8797181c64ca	gregory.a.starr+test2@gmail.com	Gregory	Starr	ACTIVE	t	2025-11-15 23:51:49.147	::1	node	modal	\N	2025-11-15 23:51:55.618	\N	\N	\N	0	0	0	dc9e941f8aedf229a1e3184daaa341c7a93ce1f9e7db394e54cd3f3e89b65b39	\N	\N	2025-11-15 23:51:49.148	2025-11-15 23:51:55.618
\.


--
-- Data for Name: newsletter_templates; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.newsletter_templates (id, name, description, content, "htmlContent", variables, "isDefault", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.order_items (id, "orderId", "marketplaceItemId", name, description, price, quantity, subtotal, "itemType", "digitalDownloadUrl", "licenseKey", customizations, "fulfillmentStatus") FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.orders (id, "orderNumber", status, total, subtotal, "taxAmount", "shippingAmount", "discountAmount", currency, "customerEmail", "customerName", "billingAddress", "shippingAddress", "paymentMethod", "paymentStatus", "paymentId", "paymentData", "userId", "fulfillmentStatus", "shippedAt", "deliveredAt", "trackingNumber", notes, "internalNotes", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.password_reset_tokens (id, token, "userId", "expiresAt", used, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.posts (id, title, slug, content, excerpt, "featuredImage", status, "publishedAt", "createdAt", "updatedAt", "authorId", "categoryId", "metaTitle", "metaDescription", keywords, "viewCount", featured, pinned, "sortOrder", locale) FROM stdin;
0e8130c7-68f7-4081-baa7-fe1ab58b25d6	Creating Reusable Components in React with TypeScript	react-typescript-components	# Creating Reusable Components in React with TypeScript\n\n> Write robust, type-safe, and reusable UI components in React using TypeScript.\n\n---\n\n## Introduction\n\nReact’s component-based architecture is ideal for building **reusable UI elements**. However, without type safety, components can become hard to maintain and debug. **TypeScript** strengthens React development by catching errors early, providing better IDE support, and improving documentation through type annotations.\n\nThis guide explores how to create **reusable, type-safe components** in React with TypeScript.\n\n---\n\n## Benefits of TypeScript in React\n\n1. **Type Safety** – Prevents runtime bugs by catching type mismatches at compile time.  \n2. **Autocomplete & IntelliSense** – Improves developer productivity.  \n3. **Self-Documenting Code** – Types act as clear contracts for component props.  \n4. **Refactor with Confidence** – Type checks ensure safe refactoring.\n\n---\n\n## Basic Example: Button Component\n\n```tsx\ntype ButtonProps = {\n  label: string;\n  onClick: () => void;\n  disabled?: boolean;\n};\n\nexport const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false }) => {\n  return (\n    <button\n      onClick={onClick}\n      disabled={disabled}\n      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"\n    >\n      {label}\n    </button>\n  );\n};\n```\n\n✅ Clear prop types  \n✅ Optional `disabled` prop  \n✅ Prevents invalid usage (e.g., missing `onClick` handler)\n\n---\n\n## Using Generics for Flexible Components\n\nGenerics make components reusable across data types.\n\n```tsx\ntype ListProps<T> = {\n  items: T[];\n  renderItem: (item: T) => React.ReactNode;\n};\n\nexport function List<T>({ items, renderItem }: ListProps<T>) {\n  return <ul>{items.map((item, i) => <li key={i}>{renderItem(item)}</li>)}</ul>;\n}\n```\n\nUsage:\n\n```tsx\n<List items={[1, 2, 3]} renderItem={(n) => <span>{n}</span>} />\n<List items={[{ id: 1, name: "Alice" }]} renderItem={(u) => <p>{u.name}</p>} />\n```\n\n---\n\n## Extending Native HTML Elements\n\nYou can extend native props for flexibility.\n\n```tsx\ntype InputProps = React.InputHTMLAttributes<HTMLInputElement> & {\n  label: string;\n};\n\nexport const Input: React.FC<InputProps> = ({ label, ...props }) => (\n  <label className="flex flex-col gap-1">\n    <span>{label}</span>\n    <input {...props} className="border px-2 py-1 rounded" />\n  </label>\n);\n```\n\n✅ Supports all `<input>` attributes (`type`, `placeholder`, etc.)  \n✅ Strongly typed with TypeScript\n\n---\n\n## Component Composition\n\nPrefer **composition** over prop drilling.\n\n```tsx\ntype CardProps = {\n  title: string;\n  children: React.ReactNode;\n};\n\nexport const Card: React.FC<CardProps> = ({ title, children }) => (\n  <div className="border rounded p-4 shadow">\n    <h2 className="text-lg font-bold mb-2">{title}</h2>\n    {children}\n  </div>\n);\n```\n\nUsage:\n\n```tsx\n<Card title="Profile">\n  <p>User details go here.</p>\n</Card>\n```\n\n---\n\n## Avoiding Common Mistakes\n\n1. ❌ Using `any` for props – defeats TypeScript’s benefits.  \n2. ❌ Ignoring strict mode – enable `strict` in `tsconfig.json`.  \n3. ❌ Forgetting default props – always define defaults for optional props.  \n4. ❌ Overcomplicating generics – use only when truly necessary.\n\n---\n\n## Best Practices\n\n- Use **React.FC<Props>** or function components with explicit prop types.  \n- Use **utility types** (`Partial`, `Pick`, `Omit`) for flexible prop definitions.  \n- Document props with JSDoc-style comments.  \n- Build and showcase components in **Storybook** for visibility.  \n- Write tests with **React Testing Library** + **TypeScript** integration.\n\n---\n\n## References\n\n- [TypeScript Handbook](https://www.typescriptlang.org/docs/)  \n- [React + TypeScript Cheatsheets](https://react-typescript-cheatsheet.netlify.app/)  \n- [Storybook](https://storybook.js.org/)  \n\n---\n\n## Conclusion\n\nBy combining React with TypeScript, developers can build **robust, reusable, and maintainable UI components**. Start small with typed props, then move to generics and composition patterns. With proper testing and documentation, your component library will scale confidently across projects.\n	Comprehensive guide to creating reusable React components with TypeScript, covering typed props, generics, composition, and best practices.	https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80	PUBLISHED	2025-08-17 09:05:00	2025-09-11 07:48:06.196	2025-09-11 07:49:35.789	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	45703cfb-91f3-4a1c-80f6-c453c666c9ad	\N	\N	{}	99	t	f	\N	en
8af84003-8c25-4302-95b2-b3dace67ec90	How to Build a Design System with Tailwind CSS	build-design-system-tailwind	# How to Build a Design System with Tailwind CSS\n\n> Discover how to create scalable design systems using utility-first CSS and component libraries.\n\n---\n\n## Why a Design System?\n\nA **design system** is a collection of reusable components, styles, and guidelines that ensures consistency across your product. It helps teams move faster, reduces UI debt, and enforces brand identity.\n\n**Tailwind CSS** is a perfect foundation for design systems because it provides:  \n- **Utility-first classes** for rapid development.  \n- **Customizable configuration** for tokens (colors, typography, spacing).  \n- **Composable components** when paired with React/Vue/Svelte.  \n\n---\n\n## Setting Up Tailwind\n\nInstall Tailwind in your project:\n\n```bash\nnpm install -D tailwindcss postcss autoprefixer\nnpx tailwindcss init -p\n```\n\nUpdate `tailwind.config.js`:\n\n```js\nmodule.exports = {\n  content: ["./src/**/*.{js,ts,jsx,tsx}"],\n  theme: {\n    extend: {\n      colors: {\n        brand: {\n          DEFAULT: "#4f46e5",\n          light: "#818cf8",\n          dark: "#3730a3",\n        },\n      },\n      fontFamily: {\n        sans: ["Inter", "sans-serif"],\n      },\n    },\n  },\n};\n```\n\nThis establishes **design tokens**: color palette, typography, and spacing.\n\n---\n\n## Creating Design Tokens\n\nTokens are the foundation of any design system. Define them in `tailwind.config.js`:\n\n```js\ntheme: {\n  colors: {\n    primary: "#1e3a8a",\n    secondary: "#9333ea",\n    neutral: "#6b7280",\n  },\n  spacing: {\n    1: "0.25rem",\n    2: "0.5rem",\n    4: "1rem",\n    8: "2rem",\n  },\n  borderRadius: {\n    sm: "4px",\n    md: "8px",\n    lg: "16px",\n  },\n}\n```\n\n---\n\n## Building Components\n\nPair Tailwind with a component framework (React/Stencil). Example: **Button**.\n\n```tsx\ntype ButtonProps = {\n  children: React.ReactNode;\n  variant?: "primary" | "secondary";\n};\n\nexport function Button({ children, variant = "primary" }: ButtonProps) {\n  const base = "px-4 py-2 rounded-md font-medium transition";\n  const variants = {\n    primary: "bg-brand text-white hover:bg-brand-dark",\n    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",\n  };\n  return <button className={`${base} ${variants[variant]}`}>{children}</button>;\n}\n```\n\n---\n\n## Component Guidelines\n\n- **Accessibility**: Always include proper ARIA attributes.  \n- **Responsiveness**: Test at multiple breakpoints.  \n- **Variants & States**: Support hover, focus, disabled states.  \n- **Documentation**: Showcase in Storybook or similar.  \n\n---\n\n## Storybook Integration\n\nStorybook is great for documenting design systems.\n\n```bash\nnpx storybook init\n```\n\nExample `Button.stories.tsx`:\n\n```tsx\nimport { Button } from "./Button";\nimport type { Meta, StoryObj } from "@storybook/react";\n\nconst meta: Meta<typeof Button> = {\n  title: "Components/Button",\n  component: Button,\n};\nexport default meta;\n\nexport const Primary: StoryObj = {\n  args: { children: "Click me", variant: "primary" },\n};\n```\n\n---\n\n## Advanced Tips\n\n- **Tailwind Plugins**: Use plugins for forms, typography, aspect-ratio.  \n- **Theming**: Support light/dark mode via Tailwind’s `darkMode: "class"`.  \n- **Scalability**: Adopt a monorepo with shared `@design-system` package.  \n- **Automation**: Lint utilities with [eslint-plugin-tailwindcss](https://github.com/francoismassart/eslint-plugin-tailwindcss).  \n\n---\n\n## Reference Diagram\n\n```mermaid\ngraph TD\n  A[Design Tokens] --> B[Components]\n  B --> C[Patterns]\n  C --> D[Applications]\n```\n\n---\n\n## References\n\n- [Tailwind CSS Documentation](https://tailwindcss.com/docs)  \n- [Storybook Docs](https://storybook.js.org/)  \n- [Design Systems Handbook by InVision](https://www.designbetter.co/design-systems-handbook)  \n\n---\n\n## Conclusion\n\nBuilding a design system with Tailwind CSS empowers teams to **ship faster, stay consistent, and scale design practices**. Start with tokens, move to components, document everything, and adopt a culture of iteration.\n	Step-by-step guide on creating a scalable design system using Tailwind CSS, design tokens, components, and Storybook.	https://images.unsplash.com/photo-1558655146-364adaf1fcc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80	PUBLISHED	2025-08-17 09:10:00	2025-09-11 07:48:06.2	2025-09-11 07:49:35.792	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	45703cfb-91f3-4a1c-80f6-c453c666c9ad	\N	\N	{}	8	t	f	\N	en
1e55a34b-19da-48bf-8eea-abf9a4c9d188	A Practical Guide to Deploying Web Apps with Vercel	deploying-web-apps-vercel	# A Practical Guide to Deploying Web Apps with Vercel\n\n> Deploying web applications has never been easier. Learn how to use Vercel for zero-config deployment.\n\n---\n\n## Introduction\n\nModern web development emphasizes **speed of iteration, scalability, and ease of deployment**. Vercel, the company behind **Next.js**, offers a platform that allows developers to deploy applications globally with minimal configuration. It’s particularly suited for **frontend frameworks** (React, Next.js, Vue, Svelte) but can also serve backend APIs via **Serverless Functions** and **Edge Functions**.\n\nIn this guide, we’ll walk through **deploying a web app on Vercel**, covering everything from setup to advanced features.\n\n---\n\n## Getting Started\n\n### Prerequisites\n\n- A GitHub, GitLab, or Bitbucket account  \n- A project built with Next.js, React, or another supported framework  \n- Node.js and npm installed locally  \n\n### Step 1: Install the Vercel CLI (Optional)\n\n```bash\nnpm install -g vercel\n```\n\n### Step 2: Login to Vercel\n\n```bash\nvercel login\n```\n\nThis authenticates your local environment with your Vercel account.\n\n### Step 3: Deploy Your Project\n\nFrom your project root:\n\n```bash\nvercel\n```\n\nVercel automatically detects your framework (e.g., Next.js) and configures defaults.\n\n---\n\n## Git-Based Deployments\n\nThe recommended workflow is to **connect your Git repository** to Vercel.\n\n1. Push your code to GitHub/GitLab/Bitbucket.  \n2. Import the repository in the [Vercel Dashboard](https://vercel.com/dashboard).  \n3. Every push to `main` (or any branch) triggers a deployment.  \n\n- **Preview Deployments**: Every pull request gets its own live deployment URL.  \n- **Production Deployments**: Merging to `main` triggers production deploy.  \n\n---\n\n## Configuring Vercel\n\n### Environment Variables\n\nSet environment variables in the Vercel Dashboard:\n\n```bash\nNEXT_PUBLIC_API_URL=https://api.example.com\nDATABASE_URL=postgres://user:pass@host:5432/db\n```\n\n### vercel.json\n\nCustomize your deployment:\n\n```json\n{\n  "version": 2,\n  "builds": [\n    { "src": "next.config.js", "use": "@vercel/next" }\n  ],\n  "routes": [\n    { "src": "/api/(.*)", "dest": "/api/$1" }\n  ]\n}\n```\n\n---\n\n## Advanced Features\n\n### Serverless Functions\n\nDeploy backend endpoints directly inside `/api` (for Next.js) or as standalone files:\n\n```ts\n// api/hello.ts\nexport default function handler(req, res) {\n  res.status(200).json({ message: "Hello from Vercel!" });\n}\n```\n\n### Edge Functions\n\nUltra-fast functions running close to the user:\n\n```ts\nexport const config = { runtime: "edge" };\n\nexport default async function handler(req: Request) {\n  return new Response("Hello from Edge!", { status: 200 });\n}\n```\n\n### Image Optimization\n\nNext.js `next/image` integrates seamlessly with Vercel’s **Image Optimization CDN**.\n\n### Analytics\n\nEnable **Vercel Analytics** for real-user performance metrics (Core Web Vitals).\n\n---\n\n## Best Practices\n\n1. Use **Preview Deployments** for QA before merging.  \n2. Keep secrets in Vercel’s environment variable system.  \n3. Monitor logs in the Vercel dashboard or CLI (`vercel logs`).  \n4. Use **custom domains** and configure DNS in the dashboard.  \n5. Leverage **automatic scaling** — no need to manage servers.  \n\n---\n\n## Reference Diagram\n\n```mermaid\nflowchart LR\n  Dev[Developer] -->|Push Code| Repo[GitHub/GitLab]\n  Repo -->|Webhook| Vercel[Vercel Build System]\n  Vercel --> Preview[Preview Deployment]\n  Vercel --> Prod[Production Deployment]\n  Preview --> User1[Stakeholders]\n  Prod --> World[End Users]\n```\n\n---\n\n## References\n\n- [Vercel Documentation](https://vercel.com/docs)  \n- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)  \n- [Vercel CLI](https://vercel.com/cli)  \n\n---\n\n## Conclusion\n\nVercel makes web app deployment **fast, reliable, and developer-friendly**. With built-in support for modern frameworks, automatic scaling, and global edge delivery, it’s a go-to platform for startups and enterprises alike. By adopting **Git-based workflows, environment configs, and serverless features**, you can scale projects without worrying about infrastructure.\n	Step-by-step guide on deploying web apps with Vercel, including setup, Git integration, environment variables, serverless functions, and best practices.	https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80	PUBLISHED	2025-08-17 09:15:00	2025-09-11 07:48:06.205	2025-09-11 07:49:35.795	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	45703cfb-91f3-4a1c-80f6-c453c666c9ad	\N	\N	{}	87	t	f	\N	en
1fcfc6f3-e714-4c23-aaa3-923884a31c5e	Understanding State Management in React	state-management-in-react	# Understanding State Management in React\n\n> Dive into the different strategies for managing state in modern React applications without Redux.\n\n---\n\n## Introduction\n\nState management is one of the most important aspects of building scalable React applications. Traditionally, **Redux** was the go-to solution, but modern React and its ecosystem have introduced **simpler, more efficient, and less boilerplate-heavy** alternatives.\n\nThis article explores **modern state management strategies** using React’s built-in APIs and lightweight external libraries such as **Zustand, Jotai, Recoil, and TanStack Query**.\n\n---\n\n## Local State with useState and useReducer\n\nFor simple component-level state, `useState` is sufficient. For more complex logic involving multiple related values, `useReducer` offers better structure.\n\n```tsx\ntype State = { count: number };\ntype Action = { type: "inc" } | { type: "dec" };\n\nfunction reducer(state: State, action: Action): State {\n  switch (action.type) {\n    case "inc":\n      return { count: state.count + 1 };\n    case "dec":\n      return { count: state.count - 1 };\n    default:\n      return state;\n  }\n}\n\nconst Counter: React.FC = () => {\n  const [state, dispatch] = React.useReducer(reducer, { count: 0 });\n  return (\n    <div>\n      <button onClick={() => dispatch({ type: "dec" })}>-</button>\n      <span>{state.count}</span>\n      <button onClick={() => dispatch({ type: "inc" })}>+</button>\n    </div>\n  );\n};\n```\n\n---\n\n## Global State with Context API\n\nReact’s built-in **Context API** is great for **theme, authentication, and user settings**. Avoid overusing it for frequently changing values to prevent unnecessary re-renders.\n\n```tsx\ntype Theme = "light" | "dark";\nconst ThemeContext = React.createContext<{ theme: Theme; setTheme: (t: Theme) => void } | undefined>(undefined);\n\nexport const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {\n  const [theme, setTheme] = React.useState<Theme>("light");\n  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;\n};\n\nexport const useTheme = () => {\n  const ctx = React.useContext(ThemeContext);\n  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");\n  return ctx;\n};\n```\n\nUsage:\n\n```tsx\nconst App = () => {\n  const { theme, setTheme } = useTheme();\n  return (\n    <div className={theme}>\n      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>Toggle Theme</button>\n    </div>\n  );\n};\n```\n\n---\n\n## Zustand: Minimal and Scalable State\n\n[Zustand](https://zustand-demo.pmnd.rs/) is a **lightweight state management library** that combines simplicity with performance.\n\n```tsx\nimport create from "zustand";\n\ntype Store = {\n  count: number;\n  inc: () => void;\n  dec: () => void;\n};\n\nconst useStore = create<Store>((set) => ({\n  count: 0,\n  inc: () => set((state) => ({ count: state.count + 1 })),\n  dec: () => set((state) => ({ count: state.count - 1 })),\n}));\n\nexport const Counter = () => {\n  const { count, inc, dec } = useStore();\n  return (\n    <div>\n      <button onClick={dec}>-</button>\n      <span>{count}</span>\n      <button onClick={inc}>+</button>\n    </div>\n  );\n};\n```\n\n✅ No boilerplate  \n✅ Global store accessible anywhere  \n✅ Excellent performance (uses proxies internally)\n\n---\n\n## Jotai: Atomic State Management\n\n[Jotai](https://jotai.org/) uses an **atomic model**, where each piece of state is an independent atom.\n\n```tsx\nimport { atom, useAtom } from "jotai";\n\nconst countAtom = atom(0);\n\nfunction Counter() {\n  const [count, setCount] = useAtom(countAtom);\n  return (\n    <div>\n      <button onClick={() => setCount((c) => c - 1)}>-</button>\n      <span>{count}</span>\n      <button onClick={() => setCount((c) => c + 1)}>+</button>\n    </div>\n  );\n}\n```\n\n✅ Fine-grained reactivity  \n✅ No unnecessary re-renders  \n✅ Great for modular applications\n\n---\n\n## Recoil: Declarative Global State\n\n[Recoil](https://recoiljs.org/) introduces **atoms** (shared state) and **selectors** (derived state).\n\n```tsx\nimport { atom, selector, useRecoilState, useRecoilValue } from "recoil";\n\nconst countAtom = atom({\n  key: "count",\n  default: 0,\n});\n\nconst doubledCount = selector({\n  key: "doubledCount",\n  get: ({ get }) => get(countAtom) * 2,\n});\n\nfunction Counter() {\n  const [count, setCount] = useRecoilState(countAtom);\n  const doubled = useRecoilValue(doubledCount);\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <p>Doubled: {doubled}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </div>\n  );\n}\n```\n\n✅ Great DX  \n✅ Derived state with selectors  \n✅ Integration with React Suspense\n\n---\n\n## Server State with TanStack Query\n\n[React Query (TanStack Query)](https://tanstack.com/query/latest) is the standard for **server state management**.\n\n```ts\nimport { useQuery } from "@tanstack/react-query";\n\nasync function fetchTodos() {\n  const res = await fetch("/api/todos");\n  return res.json();\n}\n\nexport function Todos() {\n  const { data, isLoading } = useQuery({ queryKey: ["todos"], queryFn: fetchTodos });\n  if (isLoading) return <p>Loading...</p>;\n  return (\n    <ul>\n      {data.map((todo: any) => (\n        <li key={todo.id}>{todo.title}</li>\n      ))}\n    </ul>\n  );\n}\n```\n\n✅ Handles caching, pagination, invalidation  \n✅ Works seamlessly with server-side rendering (Next.js)  \n✅ No need for Redux boilerplate\n\n---\n\n## Best Practices\n\n1. Start with **local state** (`useState`, `useReducer`).  \n2. Use **Context** only for true global concerns.  \n3. For scalable apps, prefer **Zustand, Jotai, or Recoil** over Redux.  \n4. Manage **server state with TanStack Query**.  \n5. Always profile and avoid premature optimization.\n\n---\n\n## References\n\n- [React Docs – State and Lifecycle](https://react.dev/learn/state-a-components-memory)  \n- [Zustand](https://github.com/pmndrs/zustand)  \n- [Jotai](https://jotai.org/)  \n- [Recoil](https://recoiljs.org/)  \n- [TanStack Query](https://tanstack.com/query/latest)  \n\n---\n\n## Conclusion\n\nModern React provides **built-in tools** that handle most local and simple global state needs. For larger apps, lightweight state libraries like **Zustand, Jotai, and Recoil** offer simpler and more ergonomic solutions than Redux. Combine them with **TanStack Query for server state**, and you’ll have a complete, modern state management strategy with minimal boilerplate and maximum flexibility.\n	Comprehensive guide to modern state management in React without Redux, covering useState, useReducer, Context, Zustand, Jotai, Recoil, and TanStack Query.	https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80	PUBLISHED	2025-08-17 09:20:00	2025-09-11 07:48:06.208	2025-09-11 07:49:35.798	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	45703cfb-91f3-4a1c-80f6-c453c666c9ad	\N	\N	{}	16	t	f	\N	en
849efe72-4095-4cb6-8c3c-ce144b726e2e	Why Your Business Needs a Custom AI Agent	custom-ai-agent-for-business	# Why Your Business Needs a Custom AI Agent\n\n> AI agents can streamline workflows, personalize experiences, and save operational costs. Here's why it matters.\n\n---\n\n## Introduction\n\nArtificial Intelligence (AI) has rapidly evolved from a research novelty into a **mission-critical business enabler**. Modern organizations increasingly adopt **custom AI agents**—software entities that autonomously perform tasks, analyze data, and interact with users or systems. Unlike generic chatbots, custom agents are designed around specific **business workflows**, making them more effective and ROI-driven.\n\n---\n\n## High-ROI Use Cases\n\n1. **Lead Triage**  \n   - Instantly qualify leads using CRM data.  \n   - Route high-value opportunities directly to sales teams.  \n   - Automate responses for low-priority or non-target leads.\n\n   ```ts\n   // Example: Auto-qualify leads with AI agent\n   const lead = { email: "ceo@enterprise.com", companySize: 5000 };\n   if (lead.companySize > 1000) {\n     agent.route("sales_enterprise_team", lead);\n   } else {\n     agent.autoRespond(lead);\n   }\n   ```\n\n2. **Customer Support Deflection**  \n   - Handle FAQs and troubleshooting automatically.  \n   - Integrate with **Zendesk, Intercom, or Freshdesk**.  \n   - Escalate only complex cases to human agents.\n\n   ```mermaid\n   flowchart TD\n     Q[Customer Question] --> AIAgent\n     AIAgent -->|FAQ Match| KB[Knowledge Base]\n     AIAgent -->|Complex| Human[Support Agent]\n   ```\n\n3. **Back-Office Automation**  \n   - Automate tasks like invoice processing, data entry, and reporting.  \n   - Integrate with ERP systems (e.g., NetSuite, SAP).  \n   - Improve **accuracy and compliance**.\n\n---\n\n## Architecture of a Custom AI Agent\n\nA robust custom AI agent usually follows an **orchestrator + tool adapter** pattern:\n\n```mermaid\ngraph TD\n  U[User/Trigger] --> O[Orchestrator Agent]\n  O -->|CRM| C[(HubSpot/Salesforce)]\n  O -->|DB| D[(Postgres, MySQL)]\n  O -->|Email| E[(SES/Gmail)]\n  O -->|API| X[(3rd Party APIs)]\n```\n\n- **Orchestrator Agent**: Core decision-making engine (usually an LLM with policies).  \n- **Adapters/Plugins**: Connect the agent to your systems (CRM, ERP, APIs).  \n- **Observability Layer**: Tracks requests, errors, and latency.  \n- **Human-in-the-loop**: Ensures oversight for high-stakes tasks.\n\n### Example Implementation (Node.js + LangChain)\n\n```ts\nimport { ChatOpenAI } from "langchain/openai";\nimport { createAgent } from "business-agent";\n\nconst llm = new ChatOpenAI({ model: "gpt-4o" });\nconst agent = createAgent({ llm });\n\nagent.addTool("crm", crmAdapter);\nagent.addTool("email", emailAdapter);\n\nagent.run("Qualify new lead from signup form");\n```\n\n---\n\n## KPI Tracking\n\nTo justify investment, **track measurable outcomes**:\n\n- **CSAT (Customer Satisfaction Score)**: Before vs. after deploying agent.  \n- **AHT (Average Handle Time)**: Time savings per case.  \n- **Deflection Rate**: % of cases handled without human intervention.  \n- **SLA Compliance**: Meeting response-time commitments.  \n- **Cost Reduction**: Hours saved × avg. employee cost.  \n\n```mermaid\ngraph TD\n  Deploy[Deploy Agent] --> Metrics[Collect Metrics]\n  Metrics --> Analyze[Analyze KPIs]\n  Analyze --> Optimize[Optimize Agent]\n```\n\n---\n\n## Security and Compliance\n\n- **Data Privacy**: Ensure compliance with GDPR/CCPA.  \n- **Audit Trails**: Log all agent decisions.  \n- **Access Control**: Restrict sensitive actions.  \n- **Red-Teaming**: Simulate adversarial prompts to test agent safety.  \n\n---\n\n## Best Practices\n\n1. Start with **one high-value workflow** (e.g., lead triage).  \n2. Use **RAG (Retrieval-Augmented Generation)** to ground responses in company data.  \n3. Build in **human override mechanisms**.  \n4. Continuously retrain with **feedback loops**.  \n5. Deploy in **stages**: dev → staging → production.  \n\n---\n\n## References\n\n- [LangChain Docs](https://docs.langchain.com)  \n- [Microsoft Autonomous Agents Research](https://arxiv.org/abs/2309.07864)  \n- [Salesforce AI Whitepaper](https://www.salesforce.com/resources/articles/ai/)  \n\n---\n\n## Conclusion\n\nCustom AI agents empower businesses to:  \n- **Scale operations without scaling headcount**.  \n- **Personalize experiences at scale**.  \n- **Reduce costs while improving KPIs**.  \n\nAs adoption accelerates, businesses that design and deploy agents strategically will gain a **competitive advantage** in efficiency, customer experience, and innovation.\n	Comprehensive guide on why businesses need custom AI agents, including use cases, architecture, KPI tracking, security, and best practices.	https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80	PUBLISHED	2025-08-17 09:25:00	2025-09-11 07:48:06.215	2025-09-11 07:49:35.801	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	45703cfb-91f3-4a1c-80f6-c453c666c9ad	\N	\N	{}	20	t	f	\N	en
e8e27425-6014-4a29-8234-ba851ddc5772	Building Real-Time Apps with Firebase and React	real-time-apps-firebase-react	# Building Real-Time Apps with Firebase and React\n\n> Combine Firebase's real-time database with React to create dynamic, responsive applications.\n\n---\n\n## Introduction\n\nReal-time experiences—where users see updates instantly without refreshing—are now an expectation in modern web apps. Think of **chat applications, collaborative editors, live dashboards, or multiplayer games**. Firebase provides a set of tools that make building such apps with React straightforward.\n\nIn this guide, we’ll cover **Firestore integration, authentication, hosting, and best practices** for scaling real-time apps.\n\n---\n\n## Initialize Project\n\nStart by creating a new React project and adding Firebase dependencies:\n\n```bash\nnpx create-react-app my-app --template typescript\ncd my-app\nnpm install firebase react-firebase-hooks\n```\n\nConfigure Firebase in `firebase.ts`:\n\n```ts\n// firebase.ts\nimport { initializeApp } from "firebase/app";\nimport { getFirestore } from "firebase/firestore";\nimport { getAuth } from "firebase/auth";\n\nconst firebaseConfig = {\n  apiKey: process.env.REACT_APP_FIREBASE_KEY,\n  authDomain: "my-app.firebaseapp.com",\n  projectId: "my-app",\n  storageBucket: "my-app.appspot.com",\n  messagingSenderId: "123456789",\n  appId: "1:123456789:web:abcdef",\n};\n\nconst app = initializeApp(firebaseConfig);\n\nexport const db = getFirestore(app);\nexport const auth = getAuth(app);\n```\n\n---\n\n## Live Collections with Firestore\n\nFirestore provides **real-time listeners** out of the box.\n\n```ts\nimport { collection, onSnapshot } from "firebase/firestore";\nimport { db } from "./firebase";\n\nfunction useTodos() {\n  const [todos, setTodos] = React.useState<any[]>([]);\n  React.useEffect(() => {\n    const unsub = onSnapshot(collection(db, "todos"), (snap) => {\n      setTodos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));\n    });\n    return () => unsub();\n  }, []);\n  return todos;\n}\n```\n\nThis hook re-renders components whenever data changes.\n\n---\n\n## Adding Authentication\n\nFirebase Auth makes it easy to add **Google, GitHub, or email/password** login.\n\n```ts\nimport { GoogleAuthProvider, signInWithPopup } from "firebase/auth";\nimport { auth } from "./firebase";\n\nasync function signInWithGoogle() {\n  const provider = new GoogleAuthProvider();\n  const result = await signInWithPopup(auth, provider);\n  console.log(result.user);\n}\n```\n\nProtect routes with `react-firebase-hooks`:\n\n```ts\nimport { useAuthState } from "react-firebase-hooks/auth";\nimport { auth } from "./firebase";\n\nfunction AuthGuard({ children }: { children: React.ReactNode }) {\n  const [user, loading] = useAuthState(auth);\n  if (loading) return <p>Loading...</p>;\n  if (!user) return <button onClick={signInWithGoogle}>Sign in</button>;\n  return <>{children}</>;\n}\n```\n\n---\n\n## Hosting with Firebase\n\nDeploy your app globally:\n\n```bash\nnpm install -g firebase-tools\nfirebase login\nfirebase init hosting\nfirebase deploy\n```\n\nYour app will be live at `https://your-app.web.app`.\n\n---\n\n## Advanced Features\n\n### Offline Support\n\nFirestore caches data locally, so users can continue using the app when offline. Updates sync when the network returns.\n\n### Security Rules\n\nDefine **fine-grained access control** with Firestore security rules:\n\n```json\nrules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /todos/{todoId} {\n      allow read, write: if request.auth != null;\n    }\n  }\n}\n```\n\n### Cloud Functions\n\nUse Cloud Functions for server-side logic:\n\n```js\nexports.sendNotification = functions.firestore\n  .document("todos/{id}")\n  .onCreate((snap, context) => {\n    const data = snap.data();\n    // Send email or push notification\n  });\n```\n\n---\n\n## Best Practices\n\n- ✅ Use indexes in Firestore for queries.  \n- ✅ Enable caching and pagination for large collections.  \n- ✅ Secure endpoints with auth and rules.  \n- ✅ Monitor usage in Firebase Console.  \n- ✅ Combine with **React Query** or **SWR** for advanced caching strategies.  \n\n---\n\n## References\n\n- [Firebase Docs](https://firebase.google.com/docs)  \n- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)  \n- [Firestore Security Rules](https://firebase.google.com/docs/rules)  \n\n---\n\n## Conclusion\n\nBy combining Firebase and React, you can create **scalable, secure, and real-time applications** with minimal setup. From authentication to Firestore listeners and deployment on Firebase Hosting, the ecosystem provides everything you need for a modern web app. Start small, then layer in features like offline support and Cloud Functions as your app grows.\n	Step-by-step guide to building real-time apps with Firebase and React, covering Firestore, authentication, hosting, and best practices.	https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80	PUBLISHED	2025-08-17 09:30:00	2025-09-11 07:48:06.219	2025-09-11 07:49:35.807	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	45703cfb-91f3-4a1c-80f6-c453c666c9ad	\N	\N	{}	94	t	f	\N	en
cfba200c-6196-4676-bd67-4460626468e6	How to Use OpenAI's API to Power Your App	using-openai-api	# How to Use OpenAI's API to Power Your App\n\n> Explore GPT-4, embeddings, and completion APIs to supercharge your app with AI.\n\n---\n\n## Introduction\n\nOpenAI’s API allows developers to integrate **powerful AI capabilities** directly into web and mobile applications. From natural language understanding to embeddings for semantic search, the API provides a wide range of functionality for building **chatbots, recommendation engines, summarizers, and more**.\n\nThis article walks you through the setup, use cases, best practices, and advanced techniques for using OpenAI’s API.\n\n---\n\n## Setup\n\n### Installation\n\n```bash\nnpm install openai\n```\n\n### Authentication\n\nAlways store your API keys in environment variables—never hard-code them.\n\n```ts\nimport OpenAI from "openai";\nconst client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });\n```\n\n---\n\n## Using Chat Completions\n\nThe **Chat Completions API** powers conversational applications.\n\n```ts\nconst res = await client.chat.completions.create({\n  model: "gpt-4o-mini",\n  messages: [{ role: "user", content: "Hello! What can you do?" }],\n});\nconsole.log(res.choices[0].message);\n```\n\n### Example: Customer Support Bot\n\n```ts\nconst supportResponse = await client.chat.completions.create({\n  model: "gpt-4o-mini",\n  messages: [\n    { role: "system", content: "You are a helpful support assistant." },\n    { role: "user", content: "I forgot my password. What should I do?" },\n  ],\n});\n```\n\n---\n\n## Embeddings for Search and Recommendations\n\nEmbeddings are numerical vector representations of text, ideal for search, clustering, and personalization.\n\n```ts\nconst emb = await client.embeddings.create({\n  model: "text-embedding-3-small",\n  input: ["Hello world", "Hola mundo"],\n});\nconsole.log(emb.data[0].embedding.length);\n```\n\n### Example: Semantic Search\n\n```ts\n// Store embeddings in a vector database (Pinecone, Weaviate, or Postgres pgvector)\nasync function semanticSearch(query: string) {\n  const queryEmb = await client.embeddings.create({\n    model: "text-embedding-3-small",\n    input: [query],\n  });\n  // Compare with stored embeddings in DB\n}\n```\n\n---\n\n## Function Calling\n\nModels can return **structured JSON** for API integration.\n\n```ts\nconst res = await client.chat.completions.create({\n  model: "gpt-4o-mini",\n  messages: [{ role: "user", content: "What’s the weather in Austin?" }],\n  functions: [\n    {\n      name: "getWeather",\n      description: "Get weather for a location",\n      parameters: {\n        type: "object",\n        properties: {\n          location: { type: "string" },\n        },\n        required: ["location"],\n      },\n    },\n  ],\n});\nconsole.log(res.choices[0].message);\n```\n\nThis allows direct integration with **external APIs** (e.g., weather, finance).\n\n---\n\n## Best Practices\n\n1. **Never expose API keys client-side**—use a backend proxy.  \n2. Add **rate limiting, retries, and logging**.  \n3. Use **streaming** for real-time responses.  \n4. Cache common responses to save costs.  \n5. Fine-tune prompts and use **system messages** for consistency.  \n\n---\n\n## Advanced Features\n\n- **Streaming API**: Stream tokens to simulate typing indicators.  \n- **Batch Requests**: Send multiple inputs for embeddings or completions.  \n- **Fine-tuning**: Train custom models with your domain data.  \n- **Vision Models**: Analyze and caption images.  \n- **Multimodal Models**: Accept both text and images as input.  \n\n---\n\n## References\n\n- [OpenAI API Docs](https://platform.openai.com/docs)  \n- [Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)  \n- [Function Calling](https://platform.openai.com/docs/guides/function-calling)  \n\n---\n\n## Conclusion\n\nThe OpenAI API provides a **versatile toolkit** for building intelligent applications. By combining chat completions, embeddings, and function calling, developers can create **conversational agents, semantic search engines, and data-driven assistants**. With proper best practices and safeguards, integrating AI into your app can dramatically enhance functionality and user experience.\n	Comprehensive guide to using OpenAI's API for chat completions, embeddings, function calling, and advanced features with code examples.	https://images.unsplash.com/photo-1676299081847-824916de030a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80	PUBLISHED	2025-08-17 09:35:00	2025-09-11 07:48:06.224	2025-09-11 07:49:35.81	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	45703cfb-91f3-4a1c-80f6-c453c666c9ad	\N	\N	{}	60	t	f	\N	en
3f43a601-29c0-4580-b2d6-0656314f6b5f	10 Common Mistakes in React Projects and How to Fix Them	react-mistakes-to-avoid	# 10 Common Mistakes in React Projects and How to Fix Them\n\n> Avoid these pitfalls that often lead to bugs, poor performance, and hard-to-maintain codebases.\n\n---\n\n## Introduction\n\nReact is one of the most widely used frontend libraries, but with its flexibility comes many pitfalls. Developers—especially those new to React—often run into the same mistakes that can cause **bugs, performance bottlenecks, or unreadable code**. In this guide, we’ll cover **10 common mistakes** in React projects and demonstrate how to fix them.\n\n---\n\n## 1) Using Index as a Key\n\nReact uses keys to identify list items. Using array indices as keys causes issues when items are reordered.\n\n❌ **Bad**:\n\n```tsx\nitems.map((item, index) => <Row key={index} item={item} />)\n```\n\n✅ **Good**:\n\n```tsx\nitems.map(item => <Row key={item.id} item={item} />)\n```\n\n---\n\n## 2) Overusing Context\n\nContext is powerful but can lead to unnecessary re-renders when overused. Use it sparingly for **global state** (theme, auth), not everything.\n\n✅ Instead, prefer props or a state management library (Zustand, Redux Toolkit).\n\n---\n\n## 3) Unnecessary Renders\n\nAvoid re-renders by memoizing components and callbacks.\n\n```tsx\nconst Row = React.memo(function Row({ item }: { item: Item }) {\n  return <div>{item.name}</div>;\n});\n\nconst MemoizedButton = React.memo(({ onClick }: { onClick: () => void }) => {\n  return <button onClick={onClick}>Click</button>;\n});\n```\n\nUse `useMemo` and `useCallback` to stabilize references.\n\n---\n\n## 4) Missing Error Boundaries\n\nWithout error boundaries, runtime errors can crash the entire app.\n\n```tsx\nclass ErrorBoundary extends React.Component<any, { hasError: boolean }> {\n  state = { hasError: false };\n  static getDerivedStateFromError() { return { hasError: true }; }\n  componentDidCatch(e: any) { console.error(e); }\n  render() {\n    return this.state.hasError ? <p>Something went wrong.</p> : this.props.children;\n  }\n}\n```\n\nWrap critical sections in `<ErrorBoundary>`.\n\n---\n\n## 5) Not Handling Async State Correctly\n\nCommon mistake: updating state after unmount.\n\n❌ **Bad**:\n\n```tsx\nuseEffect(() => {\n  fetchData().then(setData);\n}, []);\n```\n\n✅ **Good**:\n\n```tsx\nuseEffect(() => {\n  let mounted = true;\n  fetchData().then(data => mounted && setData(data));\n  return () => { mounted = false; };\n}, []);\n```\n\n---\n\n## 6) Ignoring Performance Profiling\n\nReact DevTools Profiler helps identify wasted renders.\n\n- Use `React.StrictMode` in dev.  \n- Profile large lists and use virtualization (`react-window`, `react-virtualized`).\n\n---\n\n## 7) Mixing Controlled & Uncontrolled Inputs\n\nControlled components should use state; uncontrolled rely on refs.\n\n❌ **Bad**:\n\n```tsx\n<input value={name} defaultValue="John" />\n```\n\n✅ **Good**:\n\n```tsx\n<input value={name} onChange={e => setName(e.target.value)} />\n```\n\n---\n\n## 8) Forgetting Dependency Arrays\n\nLeaving out dependencies in `useEffect` can cause stale closures or infinite loops.\n\n❌ **Bad**:\n\n```tsx\nuseEffect(() => {\n  doSomething(userId);\n}, []);\n```\n\n✅ **Good**:\n\n```tsx\nuseEffect(() => {\n  doSomething(userId);\n}, [userId]);\n```\n\n---\n\n## 9) Not Splitting Code\n\nLarge bundles slow down apps. Use **dynamic imports**:\n\n```tsx\nconst HeavyComponent = React.lazy(() => import("./HeavyComponent"));\n\nfunction App() {\n  return (\n    <React.Suspense fallback={<p>Loading...</p>}>\n      <HeavyComponent />\n    </React.Suspense>\n  );\n}\n```\n\n---\n\n## 10) No Testing\n\nSkipping testing leads to regressions.\n\n- **Unit Tests**: with Jest + React Testing Library.  \n- **E2E Tests**: with Playwright or Cypress.\n\n```tsx\nimport { render, screen } from "@testing-library/react";\nimport Button from "./Button";\n\ntest("renders button", () => {\n  render(<Button label="Click me" />);\n  expect(screen.getByText("Click me")).toBeInTheDocument();\n});\n```\n\n---\n\n## References\n\n- [React Docs](https://react.dev)  \n- [React Testing Library](https://testing-library.com/)  \n- [React Profiler](https://react.dev/tools/react-devtools)  \n\n---\n\n## Conclusion\n\nBy avoiding these mistakes, you’ll write **cleaner, more performant, and more maintainable React code**. Adopt best practices incrementally, profile regularly, and ensure your team follows consistent standards.\n	Comprehensive guide to avoiding common mistakes in React, from keys and context overuse to testing and performance profiling.	https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80	PUBLISHED	2025-08-17 09:40:00	2025-09-11 07:48:06.227	2025-09-11 07:49:35.813	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	45703cfb-91f3-4a1c-80f6-c453c666c9ad	\N	\N	{}	42	t	f	\N	en
a918366e-ec63-403a-9cc6-f95f0e525797	Staying Ahead in Frontend: Top Tools of 2025	top-frontend-tools-2025	# Staying Ahead in Frontend: Top Tools of 2025\n\n> Discover the latest tools, frameworks, and platforms shaping the future of frontend development.\n\n---\n\n## Introduction\n\nFrontend development evolves rapidly. Every year brings new frameworks, runtimes, and build tools that aim to improve **performance, scalability, and developer experience (DX)**. In 2025, a handful of tools stand out as industry leaders, helping developers stay productive and deliver faster, more reliable apps.\n\nThis article highlights the **top frontend tools of 2025** and explains why they matter, how to get started, and where they fit in modern workflows.\n\n---\n\n## Astro: Ship Less JavaScript\n\n[Astro](https://astro.build) focuses on **content-heavy websites** by introducing **partial hydration**. Instead of shipping JavaScript for the entire page, Astro only hydrates interactive components.\n\n```bash\nnpm create astro@latest\ncd my-astro-app\nnpm run dev\n```\n\nFeatures:\n- Static-site generation with islands architecture.  \n- Supports React, Vue, Svelte, and Solid components.  \n- SEO-friendly with built-in optimizations.  \n\nAstro is ideal for **blogs, marketing sites, and documentation portals** where performance and SEO are critical.\n\n---\n\n## Qwik: Resumability at Scale\n\n[Qwik](https://qwik.builder.io) introduces the concept of **resumability**, deferring hydration until user interaction. Unlike React or Vue, Qwik applications start instantly with minimal JS.\n\n```bash\nnpm create qwik@latest\ncd my-qwik-app\nnpm start\n```\n\nFeatures:\n- Near-zero initial JavaScript.  \n- Lazy-loads everything by default.  \n- Designed for **large-scale interactive apps**.  \n\nGreat for apps where **first-load performance** is crucial, such as e-commerce and enterprise dashboards.\n\n---\n\n## Bun: The All-in-One Runtime\n\n[Bun](https://bun.sh) is a fast **JavaScript runtime, bundler, test runner, and package manager**.\n\n```bash\nbun create react ./my-app\nbun run dev\n```\n\nFeatures:\n- Significantly faster than Node.js and Deno.  \n- Built-in test runner and bundler.  \n- Supports npm ecosystem out of the box.  \n\nBun reduces dependency on multiple tools, offering an **all-in-one solution** for modern full-stack apps.\n\n---\n\n## React 19: The Next Evolution\n\nReact remains dominant, and **React 19** brings major improvements:\n\n- `useEvent` hook for stable event handlers.  \n- **Server Components** with Actions & Forms for improved server integration.  \n- Better streaming support for SSR.  \n- Concurrent rendering refinements.  \n\nReact 19 cements the framework’s role as the backbone of large-scale apps.\n\n---\n\n## Visual Builders: Low-Code Acceleration\n\nTools like **Plasmic, Builder.io, and Webflow** allow developers and designers to collaborate using visual editors. In 2025, these tools are becoming more **developer-friendly** by enabling **code export, API integrations, and design tokens**.\n\nKey considerations:\n- ✅ Evaluate vendor lock-in.  \n- ✅ Ensure accessibility compliance.  \n- ✅ Confirm ability to extend with custom code.  \n\nVisual builders are best suited for **marketing teams, prototyping, and MVPs**.\n\n---\n\n## Comparing the Tools\n\n| Tool      | Key Feature              | Best For                       |\n|-----------|--------------------------|--------------------------------|\n| Astro     | Partial hydration        | Content-heavy sites, SEO       |\n| Qwik      | Resumability             | Enterprise apps, e-commerce    |\n| Bun       | All-in-one runtime       | Full-stack apps, fast builds   |\n| React 19  | Server Components & DX   | Large-scale apps, ecosystems   |\n| Visual Builders | Low-code + export | Marketing, design-driven teams |\n\n---\n\n## Best Practices for 2025\n\n1. Choose the **right tool for the job**—don’t over-engineer.  \n2. Combine frameworks where it makes sense (e.g., Astro + React).  \n3. Keep an eye on **bundle size** and **runtime performance**.  \n4. Document tool decisions for team onboarding.  \n5. Stay updated with **ecosystem roadmaps** (React RFCs, Astro/Qwik releases, Bun benchmarks).  \n\n---\n\n## References\n\n- [Astro Documentation](https://docs.astro.build)  \n- [Qwik Docs](https://qwik.builder.io/docs/)  \n- [Bun Docs](https://bun.sh/docs)  \n- [React 19 Release Notes](https://react.dev/blog)  \n- [Builder.io](https://www.builder.io/)  \n\n---\n\n## Conclusion\n\nThe frontend ecosystem in 2025 is vibrant and diverse. Tools like **Astro, Qwik, Bun, React 19, and modern visual builders** are setting the pace for the next generation of web development. By adopting these tools strategically, teams can build faster, scale better, and deliver exceptional user experiences.\n	In-depth guide to the top frontend tools of 2025, including Astro, Qwik, Bun, React 19, and visual builders, with use cases and comparisons.	https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80	PUBLISHED	2025-08-17 09:45:00	2025-09-11 07:48:06.23	2025-09-11 07:49:35.817	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	45703cfb-91f3-4a1c-80f6-c453c666c9ad	\N	\N	{}	15	t	f	\N	en
95f4f3fc-17ad-411d-aea2-b16c85722d67	Implementing Authentication with NextAuth.js	authentication-nextauth	# Implementing Authentication with NextAuth.js\n\n> Secure your Next.js apps with social login, credentials, and session management using NextAuth.js.\n\n---\n\n## Why NextAuth.js?\n\nAuthentication is one of the most common yet tricky parts of building modern web applications. You need to balance **security, developer productivity, and user experience**. Rolling your own auth is risky and time-consuming—things like token rotation, CSRF protection, and OAuth flows are easy to get wrong.  \n\n**NextAuth.js** is the community standard for Next.js authentication because:\n\n- It provides **ready-to-use OAuth providers** (Google, GitHub, Facebook, etc.).\n- Supports **email/password credentials**.\n- Handles **sessions with JWT or database persistence**.\n- Integrates seamlessly into **Next.js’ App Router** and React Server Components.\n\n---\n\n## Installation\n\nAdd NextAuth.js to your project:\n\n```bash\nnpm install next-auth @types/node\n```\n\n---\n\n## Basic Configuration\n\nCreate the **catch-all API route** for authentication:\n\n```ts\n// app/api/auth/[...nextauth]/route.ts\nimport NextAuth from "next-auth";\nimport GitHub from "next-auth/providers/github";\n\nconst handler = NextAuth({\n  providers: [\n    GitHub({\n      clientId: process.env.GH_ID!,\n      clientSecret: process.env.GH_SECRET!,\n    }),\n  ],\n  callbacks: {\n    async session({ session, token }) {\n      // Attach user id from JWT to the session object\n      session.user.id = token.sub;\n      return session;\n    },\n  },\n});\n\nexport { handler as GET, handler as POST };\n```\n\nThis example uses **GitHub OAuth**. You’ll need to set `GH_ID` and `GH_SECRET` in `.env.local`.\n\n---\n\n## Protecting Pages with an Auth Guard\n\nAdd a simple client-side guard to restrict access:\n\n```tsx\n// components/AuthGuard.tsx\n"use client";\nimport { useSession, signIn } from "next-auth/react";\n\nexport default function AuthGuard({ children }: { children: React.ReactNode }) {\n  const { status } = useSession();\n\n  if (status === "loading") return <p>Loading...</p>;\n  if (status === "unauthenticated") {\n    return <button onClick={() => signIn()}>Sign in</button>;\n  }\n  return <>{children}</>;\n}\n```\n\nWrap pages or components with `<AuthGuard>` to enforce authentication.\n\n---\n\n## Adding Multiple Providers\n\nNextAuth.js supports dozens of providers. Here’s an example with **Google and GitHub**:\n\n```ts\nimport Google from "next-auth/providers/google";\n\nconst handler = NextAuth({\n  providers: [\n    GitHub({ clientId: process.env.GH_ID!, clientSecret: process.env.GH_SECRET! }),\n    Google({ clientId: process.env.GOOGLE_ID!, clientSecret: process.env.GOOGLE_SECRET! }),\n  ],\n});\n```\n\nUsers will be able to choose their login provider.\n\n---\n\n## Using Credentials Provider (Email/Password)\n\nFor apps that require a **custom login form**:\n\n```ts\nimport Credentials from "next-auth/providers/credentials";\n\nconst handler = NextAuth({\n  providers: [\n    Credentials({\n      name: "Credentials",\n      credentials: {\n        email: { label: "Email", type: "email" },\n        password: { label: "Password", type: "password" },\n      },\n      async authorize(credentials) {\n        const user = await db.users.findUnique({ where: { email: credentials?.email } });\n        if (user && verifyPassword(credentials!.password, user.hash)) {\n          return { id: user.id, name: user.name, email: user.email };\n        }\n        return null;\n      },\n    }),\n  ],\n  session: { strategy: "jwt" },\n});\n```\n\n---\n\n## Sessions: JWT vs Database\n\n- **JWT (default)**: stateless, stored in cookies. Scales easily.\n- **Database sessions**: useful for persistent logouts, audit logs, or revocation.\n\n```ts\nimport { PrismaAdapter } from "@next-auth/prisma-adapter";\nimport { prisma } from "@/lib/db";\n\nconst handler = NextAuth({\n  adapter: PrismaAdapter(prisma),\n  session: { strategy: "database" },\n  // ...\n});\n```\n\n---\n\n## Middleware for Route Protection\n\nNextAuth.js exposes middleware to protect entire routes:\n\n```ts\n// middleware.ts\nexport { default } from "next-auth/middleware";\n\nexport const config = {\n  matcher: ["/dashboard/:path*", "/settings/:path*"],\n};\n```\n\nThis ensures only authenticated users can access those routes.\n\n---\n\n## Common Pitfalls & Best Practices\n\n1. **Environment Variables**  \n   Store all provider keys in `.env.local`. Never hard-code secrets.\n\n2. **CORS & Redirect URIs**  \n   Make sure redirect URIs match between your app and provider dashboards.\n\n3. **TypeScript Integration**  \n   Extend `Session` type in `next-auth.d.ts`:\n\n   ```ts\n   import NextAuth from "next-auth";\n\n   declare module "next-auth" {\n     interface Session {\n       user: {\n         id: string;\n         name?: string | null;\n         email?: string | null;\n       };\n     }\n   }\n   ```\n\n4. **Security Enhancements**  \n   - Enable HTTPS in production.  \n   - Set `NEXTAUTH_SECRET`.  \n   - Use `httpOnly` cookies.  \n\n---\n\n## Reference Diagram\n\nHere’s a high-level flow of OAuth in NextAuth.js:\n\n```mermaid\nsequenceDiagram\n  participant User\n  participant App\n  participant Provider\n  User->>App: Click "Sign in with GitHub"\n  App->>Provider: Redirect with client_id\n  Provider-->>App: Callback with authorization code\n  App->>Provider: Exchange code for token\n  Provider-->>App: Access Token\n  App->>User: Create Session & Set Cookie\n```\n\n---\n\n## References & Resources\n\n- [NextAuth.js Official Docs](https://next-auth.js.org/)\n- [OAuth 2.0 Simplified (Aaron Parecki)](https://oauth.net/2/)\n- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)\n\n---\n\n## Conclusion\n\nNextAuth.js makes authentication in Next.js **secure, scalable, and easy to implement**. Whether you need **social login, credentials auth, or enterprise providers**, it covers most scenarios with minimal configuration.  \n\nStart simple, measure your needs, and layer in **database sessions, custom callbacks, and middleware** as your app scales.\n	Comprehensive guide to implementing authentication in Next.js using NextAuth.js with social logins, credentials, sessions, middleware, and best practices.	https://images.unsplash.com/photo-1614064641938-3bbee52942c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80	PUBLISHED	2025-08-17 09:50:00	2025-09-11 07:48:06.235	2025-09-11 07:49:35.82	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	45703cfb-91f3-4a1c-80f6-c453c666c9ad	\N	\N	{}	56	t	f	\N	en
64d58d38-f6fc-43dd-bcfe-ba4bdb9f891e	What Is Agentic UX and Why It Matters	what-is-agentic-ux	# What Is Agentic UX and Why It Matters\n\n> Agentic UX is the design of human-AI collaboration. It's changing how we build digital experiences.\n\n---\n\n## Introduction\n\nThe rise of **autonomous and semi-autonomous AI agents** is transforming how we design user experiences. Traditional UX patterns assume that users are always in control of every action. With **Agentic UX**, we shift to designing **collaborative workflows** where users and agents work together, share decision-making, and balance automation with oversight.\n\nAgentic UX is essential as AI systems become **planners, decision-makers, and executors** of complex tasks—from booking travel to managing infrastructure.\n\n---\n\n## Definition of Agentic UX\n\nAgentic UX is the design of interfaces and workflows where **autonomous or semi-autonomous agents collaborate with human users**.\n\n```mermaid\nsequenceDiagram\n  participant User\n  participant Agent\n  User->>Agent: Define Goal / Intent\n  Agent->>Agent: Plan using Tools + Data\n  Agent->>User: Propose Plan + Risks\n  User->>Agent: Approve / Adjust\n  Agent->>User: Execute & Explain Steps\n```\n\nThis framework ensures **transparency, trust, and recoverability** in AI-driven systems【153†source】.\n\n---\n\n## Design Principles\n\n1. **Transparency** – Agents should communicate **plans, confidence levels, and uncertainties** clearly.  \n2. **Guardrails** – Provide **safe defaults, reversible actions, and confirmation dialogs** for high-impact operations.  \n3. **Recovery** – Allow **undo/rollback** to restore state.  \n4. **Escalation** – Agents should **ask permission before performing high-risk actions**.  \n5. **Feedback Loops** – Users must have ways to provide feedback and adjust agent behavior over time.\n\n---\n\n## Key UI Patterns\n\n### Task Boards\nShow the agent’s planned steps in a visual kanban-like board.\n\n### Confidence Badges\nDisplay confidence scores on agent recommendations.\n\n### Explainability Tooltips\nOffer “why” explanations so users can understand reasoning.\n\n### Human-in-the-Loop Checklists\nBefore execution, agents pause and request human approval.\n\n### Example: Agent-Guided Workflow\n\n```tsx\nfunction TaskStep({ step, confidence }: { step: string; confidence: number }) {\n  return (\n    <div className="p-2 border rounded mb-2">\n      <p>{step}</p>\n      <span>Confidence: {confidence}%</span>\n    </div>\n  );\n}\n```\n\n---\n\n## Implementation Example with React\n\n```tsx\ntype AgentPlan = {\n  step: string;\n  confidence: number;\n};\n\nconst plan: AgentPlan[] = [\n  { step: "Search flights to NYC", confidence: 92 },\n  { step: "Compare ticket prices", confidence: 87 },\n  { step: "Propose best itinerary", confidence: 90 },\n];\n\nexport default function AgentPlanUI() {\n  return (\n    <div>\n      <h2>Agent Plan</h2>\n      {plan.map((s, i) => (\n        <TaskStep key={i} step={s.step} confidence={s.confidence} />\n      ))}\n    </div>\n  );\n}\n```\n\n---\n\n## Example Use Cases\n\n1. **AI Project Management Tools**  \n   Agents help schedule tasks, assign resources, and alert when risks emerge.  \n\n2. **Healthcare Applications**  \n   AI suggests treatment plans but requires human sign-off.  \n\n3. **DevOps & IT Operations**  \n   Agents propose infrastructure changes, users approve before deployment.  \n\n4. **Creative Tools**  \n   Agents draft designs or code, while humans review and adjust.\n\n---\n\n## Research and References\n\n- [Human-AI Collaboration Patterns](https://arxiv.org/abs/2304.XXXX)  \n- [Nielsen Norman Group: Designing AI UX](https://www.nngroup.com/articles/ai-ux/)  \n- [Agent UX Principles (LangChain Blog)](https://blog.langchain.dev)  \n\n---\n\n## Conclusion\n\nAgentic UX is not about replacing users—it’s about **augmenting them with AI collaborators**. By embedding **transparency, guardrails, explainability, and human oversight**, we ensure AI systems remain **trustworthy and effective**. As AI agents become more capable, **Agentic UX will define the future of digital product design**【153†source】.\n	In-depth guide to Agentic UX: designing human-AI collaboration with transparency, guardrails, explainability, and human-in-the-loop workflows.	https://images.unsplash.com/photo-1559028006-448665bd7c7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80	PUBLISHED	2025-08-17 09:55:00	2025-09-11 07:48:06.238	2025-09-11 07:49:35.823	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	45703cfb-91f3-4a1c-80f6-c453c666c9ad	\N	\N	{}	12	t	f	\N	en
526f91ce-9aa3-4c1b-a84d-1a9eef9e7bec	Using RAG (Retrieval-Augmented Generation) for Knowledge-Based Apps	using-rag-for-knowledge-apps	# Using RAG (Retrieval-Augmented Generation) for Knowledge-Based Apps\n\n> RAG enables powerful contextual chat and query systems for your documents, wikis, and knowledge bases.\n\n---\n\n## Introduction\n\nAs businesses accumulate vast amounts of **unstructured data** (documents, wikis, PDFs, logs), the challenge becomes retrieving the **right information** quickly. Traditional search systems often fail to deliver precise answers because they return documents, not **direct responses**.\n\n**Retrieval-Augmented Generation (RAG)** bridges this gap by combining a **retriever** (search over your knowledge base) with a **generator** (LLM like GPT). Instead of hallucinating, the model grounds its responses in your actual data.\n\n---\n\n## RAG Architecture\n\n```mermaid\nflowchart LR\n  Q[User Query] --> S[Embed + Vector Search]\n  S --> K[(Top-k Chunks)]\n  K --> P[Prompt Builder]\n  P --> L[LLM]\n  L --> A[Answer + Citations]\n```\n\n1. User query is embedded and matched against a **vector database**.  \n2. Top-k chunks of relevant text are retrieved.  \n3. The retriever passes these to the LLM in a **prompt template**.  \n4. The LLM generates an **answer with citations**, grounded in retrieved data.\n\n---\n\n## Indexing Documents\n\nFirst, chunk and embed your documents.\n\n```python\n# pip install langchain-openai chromadb\nfrom langchain_openai import OpenAIEmbeddings\nfrom langchain_community.vectorstores import Chroma\n\nembeddings = OpenAIEmbeddings()\ntexts = ["Doc chunk 1...", "Doc chunk 2..."]\nvectordb = Chroma.from_texts(texts, embeddings, collection_name="kb")\n```\n\n✅ Use **semantic embeddings** for better retrieval.  \n✅ Chunk size matters—too small loses context, too large bloats prompts.\n\n---\n\n## Retrieval + Generation Workflow\n\nQuery your knowledge base with retrieval + LLM:\n\n```python\nfrom langchain.chains import RetrievalQA\nfrom langchain_openai import ChatOpenAI\n\nllm = ChatOpenAI(model="gpt-4o")\nretriever = vectordb.as_retriever(search_kwargs={"k": 4})\nqa = RetrievalQA.from_chain_type(llm=llm, retriever=retriever)\n\nprint(qa.run("What does the policy say about remote work?"))\n```\n\n---\n\n## Enhancing Quality\n\n### Chunking Strategies\n- **Fixed size** (e.g., 500 tokens, 50 overlap).  \n- **Semantic chunking** (split by meaning, not length).  \n\n### Hybrid Retrieval\n- Combine **BM25 keyword search** + **vector search**.  \n\n### Reranking\n- Use a **cross-encoder** to re-rank retrieved chunks for precision.  \n\n### Metadata Filters\n- Store attributes (author, date, category) and filter at query time.  \n\n---\n\n## Example Use Cases\n\n1. **Internal Knowledge Base Search**  \n   Employees ask questions and get direct answers from company policies.  \n\n2. **Customer Support Bots**  \n   Agents grounded in FAQs, product manuals, and troubleshooting docs.  \n\n3. **Legal & Compliance Research**  \n   Quickly retrieve contract clauses and regulatory guidelines.  \n\n4. **Healthcare Applications**  \n   Summarize patient history grounded in EHR data.  \n\n---\n\n## Scaling Considerations\n\n- Use **FAISS, Pinecone, or Weaviate** for large-scale vector search.  \n- Cache frequent queries to reduce costs.  \n- Monitor **latency**—vector search + LLM calls can be slow.  \n- Ensure **security**—encrypt stored embeddings if sensitive data.  \n\n---\n\n## References\n\n- [LangChain Documentation](https://python.langchain.com)  \n- [Chroma Vector DB](https://www.trychroma.com/)  \n- [Pinecone](https://www.pinecone.io/)  \n- [Weaviate](https://weaviate.io/)  \n\n---\n\n## Conclusion\n\nRAG transforms static knowledge bases into **conversational, intelligent assistants**. By carefully tuning chunking, retrieval, and reranking strategies, you can deliver **accurate, contextual, and explainable answers**—a massive step forward compared to traditional search.  \n\nStart small with a vector DB like Chroma, integrate retrieval with an LLM, and expand to production-ready stacks with Pinecone or Weaviate as you scale.\n	Comprehensive guide to Retrieval-Augmented Generation (RAG) for building knowledge-based apps, covering architecture, indexing, retrieval, and scaling.	https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80	PUBLISHED	2025-08-17 10:00:00	2025-09-11 07:48:06.241	2025-09-11 07:49:35.827	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	45703cfb-91f3-4a1c-80f6-c453c666c9ad	\N	\N	{}	12	t	f	\N	en
7677faba-e752-457c-9d58-809758f68648	From Monolith to Micro Frontends: A Transition Guide	monolith-to-micro-frontends	# From Monolith to Micro Frontends: A Transition Guide\n\n> Learn the why, when, and how of breaking up large frontend apps into modular micro frontends.\n\n---\n\n## Introduction\n\nAs applications grow in size and complexity, the traditional **monolithic frontend** model becomes harder to scale. Large teams struggle with long build times, merge conflicts, and tightly coupled dependencies. **Micro frontends** break the frontend into smaller, autonomous pieces that can be developed, tested, and deployed independently.\n\nThis guide explains when to adopt micro frontends, how to implement them, and best practices to ensure long-term maintainability.\n\n---\n\n## When Micro Frontends Make Sense\n\nMicro frontends are not always the right choice. They shine in cases where:\n\n- Multiple teams are contributing to the same application.  \n- Release velocity is critical, and teams need autonomy.  \n- The UI surface is large and modular (e.g., dashboards, e-commerce platforms).  \n- You want to incrementally migrate from legacy monoliths to modern stacks.  \n\n**Do not** adopt micro frontends if your app is small, or if your team lacks the bandwidth to manage complexity.\n\n---\n\n## Composition with Module Federation\n\n**Webpack Module Federation** is the most popular way to implement micro frontends today. It allows different applications (hosts and remotes) to share components and libraries at runtime.\n\n### Host Configuration\n\n```js\n// webpack.config.js (host)\nconst { ModuleFederationPlugin } = require("webpack").container;\nmodule.exports = {\n  plugins: [\n    new ModuleFederationPlugin({\n      name: "host",\n      remotes: {\n        cart: "cart@/cart/remoteEntry.js",\n      },\n      shared: {\n        react: { singleton: true },\n        "react-dom": { singleton: true },\n      },\n    }),\n  ],\n};\n```\n\n### Remote Usage\n\n```tsx\n// Host imports a remote component\nimport React from "react";\nconst CartWidget = React.lazy(() => import("cart/Widget"));\n\nexport default function Header() {\n  return (\n    <React.Suspense fallback={null}>\n      <CartWidget />\n    </React.Suspense>\n  );\n}\n```\n\n### Runtime Flow\n\n```mermaid\nsequenceDiagram\n  participant U as User\n  participant H as Host Shell\n  participant R as Remote (Cart)\n  U->>H: Navigate\n  H->>R: Load remoteEntry.js\n  R-->>H: Expose Cart/Widget\n  H->>U: Render integrated UI\n```\n\n---\n\n## Migration Strategies\n\n1. **Strangler Pattern**  \n   Gradually replace sections of the monolith with micro frontends.\n\n2. **Domain-Driven Boundaries**  \n   Align micro frontends with business domains (e.g., Checkout, Catalog, Profile).\n\n3. **Vertical Slices**  \n   Each micro frontend owns **UI + state + API calls** for its feature.\n\n4. **Wrapper Shell**  \n   The host (shell) manages global layout, routing, and shared dependencies.\n\n---\n\n## CI/CD & Versioning\n\nEach micro frontend should have its own deployment pipeline. Best practices include:\n\n- **Semantic Versioning** for shared packages.  \n- **Contract Testing** to prevent breaking changes.  \n- **Visual Regression Testing** with tools like Chromatic or Percy.  \n- **Canary Releases** to test new features safely.  \n\nExample GitHub Actions snippet:\n\n```yaml\nname: Deploy Microfrontend\non:\n  push:\n    branches: [main]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm install\n      - run: npm run build\n      - run: vercel deploy --prod\n```\n\n---\n\n## Performance Considerations\n\n- Use **lazy loading** to avoid bloated bundles.  \n- Deduplicate dependencies across micro frontends with `singleton` configs.  \n- Cache `remoteEntry.js` aggressively.  \n- Monitor Core Web Vitals per micro app.  \n\n---\n\n## Alternative Approaches\n\n- **iframe Composition**: Simple but limited; isolation comes at a cost.  \n- **Single-SPA**: Framework-agnostic micro frontend orchestration.  \n- **Module Federation + NX**: Use NX monorepos for code sharing, CI orchestration, and dependency graphs.  \n\n---\n\n## References\n\n- [Webpack Module Federation Docs](https://webpack.js.org/concepts/module-federation/)  \n- [Single-SPA](https://single-spa.js.org/)  \n- [Micro Frontends.org](https://micro-frontends.org/)  \n- [Martin Fowler on Micro Frontends](https://martinfowler.com/articles/micro-frontends.html)  \n\n---\n\n## Conclusion\n\nMicro frontends provide a scalable architecture for large teams and complex apps. By splitting applications into modular units, organizations can **increase autonomy, reduce release friction, and modernize incrementally**. Adopt them carefully, starting small, and enforce **contracts, versioning, and testing** to avoid chaos.\n	Comprehensive guide to transitioning from monolithic frontends to micro frontends with Module Federation, migration strategies, CI/CD, and performance considerations.	https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80	PUBLISHED	2025-08-17 10:05:00	2025-09-11 07:48:06.244	2025-09-11 07:49:35.83	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	45703cfb-91f3-4a1c-80f6-c453c666c9ad	\N	\N	{}	96	t	f	\N	en
4659a7ec-1cdf-4de0-aba6-c787e040d38f	Integrating AI with Your Web App: A Starter Guide	integrating-ai-web-app	# Integrating AI with Your Web App: A Starter Guide\n\n> Learn how to embed AI features like chatbots and NLP into your web applications.\n\n---\n\n## Introduction\n\nArtificial Intelligence (AI) is transforming the web, enabling applications to be more **interactive, personalized, and intelligent**. From **chatbots and recommendation systems** to **natural language processing (NLP) and computer vision**, developers can now easily integrate AI into their web apps using APIs, SDKs, and open-source libraries.\n\nThis guide provides a step-by-step overview of how to add AI capabilities to your web app, covering tools, frameworks, and best practices.\n\n---\n\n## Key AI Use Cases in Web Apps\n\n1. **Chatbots & Virtual Assistants**  \n   Provide real-time customer support using conversational AI.\n\n   ```ts\n   // Example: simple chatbot integration with OpenAI API\n   import OpenAI from "openai";\n   const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });\n   const res = await client.chat.completions.create({\n     model: "gpt-4o-mini",\n     messages: [{ role: "user", content: "Hello, how can you help me?" }],\n   });\n   console.log(res.choices[0].message);\n   ```\n\n2. **Natural Language Processing (NLP)**  \n   Extract meaning from text (sentiment, entity recognition, summarization).  \n\n   ```python\n   from transformers import pipeline\n   nlp = pipeline("sentiment-analysis")\n   result = nlp("The new product launch was amazing!")\n   print(result)\n   ```\n\n3. **Recommendations & Personalization**  \n   Suggest content, products, or actions using collaborative filtering or embeddings.\n\n4. **Image Recognition & Computer Vision**  \n   Upload and classify images with APIs like Google Vision or AWS Rekognition.\n\n---\n\n## Integration Approaches\n\n### API-First Integration\n\nEasiest way to add AI is via APIs from providers like:  \n- **OpenAI** (LLMs, embeddings)  \n- **Hugging Face** (NLP, models)  \n- **Google Cloud AI / AWS AI Services**  \n\nExample: Sentiment Analysis with Hugging Face API\n\n```bash\ncurl -X POST https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english     -H "Authorization: Bearer $HF_API_KEY"     -d '{"inputs": "I love this new app!"}'\n```\n\n### On-Device or Self-Hosted Models\n\nFor privacy and cost control, run models locally using frameworks like **TensorFlow.js**, **ONNX Runtime**, or **PyTorch**.\n\n```js\nimport * as tf from "@tensorflow/tfjs";\nconst model = await tf.loadLayersModel("/model.json");\n```\n\n---\n\n## Architecture Considerations\n\n```mermaid\ngraph TD\n  User -->|Request| WebApp[Frontend React/Next.js]\n  WebApp --> API[Backend Server/Serverless Functions]\n  API --> AI[AI Provider / Model Hosting]\n  AI --> API\n  API --> WebApp\n  WebApp --> User\n```\n\n- **Frontend**: Collects user input (text, images, voice).  \n- **Backend**: Calls AI APIs or runs models.  \n- **AI Provider**: Executes inference and returns results.  \n\n---\n\n## Deployment & Scaling\n\n- Use **serverless functions** (Vercel, AWS Lambda) for low-latency inference.  \n- Cache frequent AI responses to reduce costs.  \n- Implement **rate limiting** to handle traffic spikes.  \n- Monitor performance with logs and tracing.  \n\n---\n\n## Security & Compliance\n\n- **Never expose API keys in the frontend**. Use a backend proxy.  \n- Ensure **data privacy** (especially with PII).  \n- Comply with **GDPR/CCPA** when storing and processing data.  \n- Add **content filters** and guardrails for generative AI.  \n\n---\n\n## Best Practices\n\n1. Start with **one AI feature** (chatbot, sentiment analysis).  \n2. Optimize user flows with **progressive enhancement** (fallback if AI fails).  \n3. Monitor **latency and accuracy** continuously.  \n4. Gather user feedback to improve AI performance.  \n5. Document usage and integrate **explainability** (e.g., show why a recommendation was made).  \n\n---\n\n## References\n\n- [OpenAI API Docs](https://platform.openai.com/docs)  \n- [Hugging Face Transformers](https://huggingface.co/transformers)  \n- [TensorFlow.js](https://www.tensorflow.org/js)  \n- [ONNX Runtime](https://onnxruntime.ai/)  \n\n---\n\n## Conclusion\n\nIntegrating AI into your web application is now easier than ever. By starting small (chatbots, NLP, recommendations), and leveraging APIs or self-hosted models, you can quickly deliver **smarter, more engaging user experiences**.  \n\nAs AI matures, every web app will need at least some form of intelligence layer—making now the perfect time to get started.\n	Step-by-step guide to integrating AI with your web app: chatbots, NLP, recommendations, architecture, scaling, and security best practices.	https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80	PUBLISHED	2025-08-17 09:00:00	2025-09-11 07:48:06.19	2025-09-11 07:49:35.782	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	45703cfb-91f3-4a1c-80f6-c453c666c9ad	\N	\N	{}	68	t	f	\N	en
d341bc13-5877-4327-8f99-2b079f8b6bdc	Optimizing Web Vitals for Better UX and SEO	optimizing-web-vitals	# Optimizing Web Vitals for Better UX and SEO\n\n> Web Vitals are core to Google's ranking. Learn how to measure and improve them effectively.\n\n---\n\n## Introduction\n\nUser experience (UX) is no longer just about aesthetics—it directly impacts **search engine ranking and business outcomes**. Google’s **Core Web Vitals (CWV)** are the key metrics every web developer should monitor. They focus on **loading performance, interactivity, and visual stability**, which directly affect bounce rates, engagement, and SEO.\n\n---\n\n## What Are Core Web Vitals?\n\n1. **Largest Contentful Paint (LCP)** – Measures how quickly the largest content element is rendered. Target: **< 2.5s**.  \n2. **Interaction to Next Paint (INP)** – Replaces FID; measures overall responsiveness. Target: **< 200ms**.  \n3. **Cumulative Layout Shift (CLS)** – Measures unexpected layout shifts. Target: **< 0.1**.\n\nThese metrics are part of Google’s ranking algorithm and directly influence SEO.\n\n---\n\n## Measurement Setup\n\n### Local Testing with Lighthouse\n\nRun audits locally in Chrome DevTools:\n\n```bash\nnpx lighthouse https://example.com --view\n```\n\n### Real User Monitoring (RUM)\n\nUse the **web-vitals** package for production metrics:\n\n```bash\nnpm install web-vitals\n```\n\n```ts\n// src/rum/webVitals.ts\nimport { onCLS, onINP, onLCP } from "web-vitals";\n\nfunction sendToAnalytics(metric: any) {\n  fetch("/api/vitals", {\n    method: "POST",\n    body: JSON.stringify(metric),\n    keepalive: true,\n    headers: { "Content-Type": "application/json" },\n  });\n}\n\nonLCP(sendToAnalytics);\nonCLS(sendToAnalytics);\nonINP(sendToAnalytics);\n```\n\n---\n\n## Improving LCP\n\n- Use **modern image formats** (WebP, AVIF).  \n- **Preload** critical assets (fonts, hero images).  \n- Inline critical CSS and lazy-load the rest.  \n\n```html\n<link rel="preload" as="image" href="/hero.avif" />\n<link rel="preload" as="font" href="/fonts/Inter.woff2" type="font/woff2" crossorigin />\n```\n\n```css\n.hero {\n  background: url("/hero.avif") no-repeat center;\n  background-size: cover;\n}\n```\n\n---\n\n## Eliminating CLS\n\nReserve fixed spaces for elements to prevent layout shifts:\n\n```css\n.card img {\n  width: 100%;\n  aspect-ratio: 16/9;\n  object-fit: cover;\n}\n```\n\n- Always specify **width** and **height** (or `aspect-ratio`) on images.  \n- Avoid injecting ads or banners without reserved space.  \n- Use **font-display: swap** to prevent invisible text flashes.  \n\n---\n\n## Reducing INP (formerly FID)\n\n- Keep JavaScript bundles small.  \n- Break long tasks into smaller chunks.  \n- Use `React.lazy` for code splitting.  \n- Schedule non-critical work with **scheduler**:\n\n```ts\nimport { unstable_scheduleCallback } from "scheduler";\n\nunstable_scheduleCallback(() => {\n  // Non-critical work\n});\n```\n\n```mermaid\nflowchart LR\n  A[User Tap/Click] --> B[Event Handler]\n  B --> C{Long Task?}\n  C -- yes --> D[Defer/Chunk Work]\n  C -- no --> E[Update UI]\n  D --> E\n```\n\n---\n\n## Monitoring & Tooling\n\n- **PageSpeed Insights** – Free Google tool for lab + field data.  \n- **Chrome User Experience Report (CrUX)** – Real-user dataset.  \n- **Performance Budgets** – Set thresholds in CI/CD to block regressions.  \n\nExample: Lighthouse CI GitHub Action\n\n```yaml\nname: Lighthouse CI\non: [push]\njobs:\n  lhci:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm install -g @lhci/cli\n      - run: lhci autorun\n```\n\n---\n\n## Best Practices Checklist\n\n- ✅ Optimize images and fonts.  \n- ✅ Inline critical CSS.  \n- ✅ Defer non-critical JavaScript.  \n- ✅ Reserve space for dynamic elements.  \n- ✅ Continuously monitor with RUM.  \n\n---\n\n## References\n\n- [Web.dev Core Web Vitals](https://web.dev/vitals/)  \n- [Google PageSpeed Insights](https://pagespeed.web.dev/)  \n- [Web Vitals GitHub](https://github.com/GoogleChrome/web-vitals)  \n\n---\n\n## Conclusion\n\nImproving Core Web Vitals is **not just about SEO**, but about creating a **faster, more stable, and more engaging user experience**. By measuring in production, optimizing assets, and continuously monitoring, you ensure your site performs well for both users and search engines.\n	Step-by-step guide on optimizing Core Web Vitals (LCP, INP, CLS) with measurement strategies, optimization techniques, and monitoring tools.	https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80	PUBLISHED	2025-08-17 10:10:00	2025-09-11 07:48:06.247	2025-09-11 07:49:35.833	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	45703cfb-91f3-4a1c-80f6-c453c666c9ad	\N	\N	{}	23	t	f	\N	en
ce5c9f51-91e5-41e5-a6a5-3514504620b3	Getting Started with Agent Zero: Building Practical AI Agents	getting-started-with-agent-zero	# Getting Started with Agent Zero: Building Practical AI Agents\n\n> Agent Zero is an open-source framework for building and orchestrating AI agents. It simplifies the process of connecting LLMs, tools, and workflows into production-ready systems.\n\n---\n\n## Introduction\n\nAgent-based AI systems are transforming how businesses automate processes and deliver intelligent solutions. **Agent Zero** is an emerging open-source project designed to help developers build, deploy, and manage AI agents with minimal friction.\n\nWhereas frameworks like LangChain and LlamaIndex provide composability, Agent Zero focuses on **lightweight orchestration, extensibility, and real-world usability**.\n\n---\n\n## Key Features of Agent Zero\n\n- **Lightweight Core** – Minimal abstractions, simple to adopt.\n- **Tool Integration** – Easily bind APIs, databases, and services.\n- **Multi-Agent Orchestration** – Run collaborative agents with role definitions.\n- **Extensibility** – Add new tools, memory backends, or reasoning strategies.\n- **Python-first** – Developer-friendly for fast prototyping.\n\n---\n\n## Use Cases\n\n1. **Customer Support Automation**  \n   Deploy chat-based agents that answer FAQs and escalate complex cases.\n\n2. **Data Retrieval & Summarization**  \n   Agents that connect to a knowledge base (docs, PDFs) and provide concise answers.\n\n3. **Business Workflow Automation**  \n   Example: an agent that triages new leads, enriches them from APIs, and routes them to CRM.\n\n4. **Research Assistants**  \n   Agents that gather, filter, and summarize data from multiple sources.\n\n---\n\n## Tutorial: Lead Qualification Agent\n\nIn this tutorial, we’ll build a simple **Lead Qualification Agent** using Agent Zero that:\n- Accepts lead info.\n- Queries an external API (like LinkedIn enrichment).\n- Classifies the lead as *qualified* or *unqualified*.\n\n### Setup\n\n```bash\npip install agent-zero openai requests\n```\n\n### Define the Agent\n\n```python\nfrom agentzero import Agent, Tool\nimport requests\n\n# Define a simple enrichment tool\nclass EnrichTool(Tool):\n    def run(self, input_data):\n        company = input_data.get("company")\n        # Mock enrichment (in reality, call LinkedIn or Clearbit API)\n        enriched = {"company": company, "size": 1200, "industry": "Tech"}\n        return enriched\n\n# Define the agent\nlead_agent = Agent(\n    name="LeadQualifier",\n    description="Qualifies leads based on company size",\n    tools=[EnrichTool()]\n)\n\n# Business logic for qualification\n@lead_agent.task\ndef qualify(data):\n    enriched = lead_agent.use("EnrichTool", data)\n    if enriched["size"] > 500:\n        return f"Qualified lead: {enriched}"\n    return f"Unqualified lead: {enriched}"\n\n# Run the agent\nprint(lead_agent.run({"company": "Acme Corp"}))\n```\n\n✅ Output:\n```\nQualified lead: {"company": "Acme Corp", "size": 1200, "industry": "Tech"}\n```\n\n---\n\n## Best Practices\n\n- Start with **one agent, one tool**, then expand.  \n- Add **memory** (short-term + vector DB) for multi-turn interactions.  \n- Log all agent actions for **auditability and debugging**.  \n- Use **evaluators** to benchmark responses before deployment.  \n\n---\n\n## References\n\n- [Agent Zero GitHub](https://github.com/agentzero-ai)  \n- [LangChain vs Agent Zero Discussion](https://discord.gg/agentzero)  \n- [Building AI Agents Best Practices](https://arxiv.org/abs/2309.07864)  \n\n---\n\n## Conclusion\n\nAgent Zero provides a **minimal yet powerful framework** for building real-world AI agents. By focusing on modularity and orchestration, it enables developers to quickly prototype and deploy agents across domains such as customer support, lead management, and research.  \n\nThe **Lead Qualification Agent** example shows how easy it is to wire business logic into an AI-driven workflow. As Agent Zero matures, it’s poised to become a strong alternative in the agent ecosystem.\n	Learn how to use Agent Zero to build practical AI agents, including a step-by-step tutorial on a lead qualification agent.	/images/blogpostimages/agent-zero.png	PUBLISHED	2025-08-28 19:15:00	2025-09-11 07:49:35.838	2025-09-11 07:49:35.838	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	66c95a59-650a-41a7-9a0c-c9c1c6327e7e	\N	\N	{}	0	t	f	\N	en
\.


--
-- Data for Name: revenue_audits; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.revenue_audits (id, title, description, status, "scheduledAt", "completedAt", duration, "timeZone", "clientName", "clientEmail", "clientPhone", company, "teamSize", industry, "currentChallenges", "specificAreas", "meetingType", "meetingUrl", "meetingId", "meetingPassword", "revenueGoals", "currentSystems", "painPoints", "expectedOutcomes", "auditResults", recommendations, "followUpScheduled", "nextSteps", "internalNotes", "assignedToId", "userId", "createdAt", "updatedAt") FROM stdin;
1b2957c1-3e0a-4e1a-a3a8-b9759cd95448	Revenue Operations Audit - Test Company	\N	PENDING	2025-11-20 09:00:00	\N	60	America/New_York	Test User	test@example.com	555-0100	Test Company	10	Technology	\N	{"Sales Process","Marketing Funnel"}	VIDEO_CALL	\N	\N	\N	Increase revenue by 20%	{}	Low conversion rates	\N	\N	\N	f	\N	\N	\N	\N	2025-11-15 23:06:22.662	2025-11-15 23:06:22.662
f0417a4b-00b1-4acd-bc1f-66fd8c4007e4	Revenue Operations Audit - Starrit llc	\N	PENDING	2025-11-17 16:00:00	\N	60	America/New_York	Gregory A Starr	gregory.a.starr@gmail.com	5129533552	Starrit llc	1	Real Estate	\N	{"Sales Process","Technology Stack","Digital Transformation"}	VIDEO_CALL	\N	\N	\N	\N	{}	\N	\N	\N	\N	f	\N	\N	\N	\N	2025-11-15 23:07:22.646	2025-11-15 23:07:22.646
\.


--
-- Data for Name: subscriber_preferences; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.subscriber_preferences (id, "subscriberId", "blogUpdates", "productUpdates", "marketplaceUpdates", "eventNotifications", "specialOffers", frequency, "categoryInterests", "tagInterests", "preferredTime", timezone, "createdAt", "updatedAt") FROM stdin;
5cf44a26-3745-4881-9cbd-1c589fe483ba	3b976f84-cd4e-47ac-a3cb-7014614535b4	t	t	t	f	f	WEEKLY	{}	{}	\N	\N	2025-11-15 23:15:19.064	2025-11-15 23:15:19.064
e19058fa-123c-4ab3-9a25-132a963e196d	10b3fe55-6e34-4695-8748-d8b4bad5409c	t	t	t	f	f	WEEKLY	{}	{}	\N	\N	2025-11-15 23:35:22.46	2025-11-15 23:35:22.46
d9ea76eb-1eaf-4dce-a0c5-3a3543200ce6	d6dfe586-c427-4223-9f15-60c987d46528	t	t	t	f	t	MONTHLY	{}	{}	\N	\N	2025-11-15 23:40:57.644	2025-11-15 23:40:57.644
dc3e51e8-e16a-4f1e-be2d-0869141d8cad	99d11035-f17a-4b95-9459-b196d809ee97	t	t	t	f	f	WEEKLY	{}	{}	\N	\N	2025-11-15 23:45:56.992	2025-11-15 23:45:56.992
93089d05-c637-423a-960d-c75e651acad9	e5240c4c-70d3-4389-853d-8b128ad3044b	t	t	t	f	f	WEEKLY	{}	{}	\N	\N	2025-11-15 23:49:14.767	2025-11-15 23:49:14.767
1aa0dff1-3f81-4316-a017-3692fcbdc176	803c3d25-3670-4b7c-bb86-21f605363777	t	t	t	f	f	WEEKLY	{}	{}	\N	\N	2025-11-15 23:50:06.828	2025-11-15 23:50:06.828
9c642503-50d0-4239-87b5-b5786865731a	a8c145dc-faf8-4ea3-9370-949f28f1f147	t	t	t	f	f	WEEKLY	{}	{}	\N	\N	2025-11-15 23:50:35.567	2025-11-15 23:50:35.567
ccccd35e-6645-435f-a52a-ad1ef546c1d9	1c6aeb7d-bb69-4824-885c-8797181c64ca	t	t	f	f	f	WEEKLY	{}	{}	\N	\N	2025-11-15 23:51:49.149	2025-11-15 23:51:49.149
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.tags (id, name, slug, "createdAt", "updatedAt") FROM stdin;
5d107f8e-39d2-4470-95a7-0fdefb4f1024	React	react	2025-09-11 07:47:37.83	2025-09-11 07:47:37.83
627928e9-d71a-45e5-a589-c5c858bff57f	Node.js	nodejs	2025-09-11 07:47:37.832	2025-09-11 07:47:37.832
ada21482-42e4-4143-8f3c-ccb3a15cbbed	JavaScript	javascript	2025-09-11 07:47:37.833	2025-09-11 07:47:37.833
0b5d74c7-83a7-488c-b1e0-9f8c7c1214ae	TypeScript	typescript	2025-09-11 07:47:37.833	2025-09-11 07:47:37.833
33284c37-d2d2-49bd-9758-556bfbd9acf9	Python	python	2025-09-11 07:47:37.834	2025-09-11 07:47:37.834
90144489-2d94-48de-ad0c-15601f0af95b	Django	django	2025-09-11 07:47:37.835	2025-09-11 07:47:37.835
c7066568-2f49-4699-b06d-a0d77d593e5f	Vue.js	vuejs	2025-09-11 07:47:37.835	2025-09-11 07:47:37.835
bdda61e5-a100-459d-8367-60371a52f49f	Angular	angular	2025-09-11 07:47:37.836	2025-09-11 07:47:37.836
0715b27d-45d0-469b-b9d2-096f7071f875	Next.js	nextjs	2025-09-11 07:47:37.836	2025-09-11 07:47:37.836
a885de4d-7cef-4025-af3c-3cd70402857f	AWS	aws	2025-09-11 07:47:37.837	2025-09-11 07:47:37.837
7af55f25-62ef-4637-9145-f98fa5d2685c	Docker	docker	2025-09-11 07:47:37.837	2025-09-11 07:47:37.837
54fd4ecf-4b67-4f66-b0fd-499bcac4d768	Kubernetes	kubernetes	2025-09-11 07:47:37.838	2025-09-11 07:47:37.838
e73d0828-94e0-4b7e-886f-7dfae65b0719	React Native	react-native	2025-09-11 07:47:37.838	2025-09-11 07:47:37.838
b4d408ba-e315-4dd7-9aeb-ce3b4616098d	Flutter	flutter	2025-09-11 07:47:37.839	2025-09-11 07:47:37.839
35379a7c-8ba7-4d92-8e52-89d8a023ab0e	GraphQL	graphql	2025-09-11 07:47:37.839	2025-09-11 07:47:37.839
41ecff56-8bec-4445-945f-1d3c85b838b6	REST API	rest-api	2025-09-11 07:47:37.84	2025-09-11 07:47:37.84
645bc43b-b096-4736-b1ce-c9475647be16	UI Design	ui-design	2025-09-11 07:47:37.84	2025-09-11 07:47:37.84
6bfa7dd7-6475-4eab-8dec-74851b8aac63	UX Design	ux-design	2025-09-11 07:47:37.841	2025-09-11 07:47:37.841
a42579f1-a48e-4e49-9923-d42b8f6dd22c	Figma	figma	2025-09-11 07:47:37.841	2025-09-11 07:47:37.841
f2b58b05-4867-4927-976b-f7e2354bbbcc	Adobe XD	adobe-xd	2025-09-11 07:47:37.842	2025-09-11 07:47:37.842
45d07a74-d4c0-4d86-94a2-b57e304649f3	Sketch	sketch	2025-09-11 07:47:37.842	2025-09-11 07:47:37.842
4268e580-cd64-4290-bd8c-e49beffa1590	Responsive Design	responsive-design	2025-09-11 07:47:37.843	2025-09-11 07:47:37.843
521dad05-3487-4bdf-b13b-46753e0fdf3d	Design Systems	design-systems	2025-09-11 07:47:37.843	2025-09-11 07:47:37.843
aa9fdf37-a838-47a5-b503-2fe1cbb7b809	Prototyping	prototyping	2025-09-11 07:47:37.844	2025-09-11 07:47:37.844
23526607-a28c-4e81-b7c2-cc9d78a2441b	SEO	seo	2025-09-11 07:47:37.844	2025-09-11 07:47:37.844
62f3edad-6d9c-47cb-bc55-d28197cba7fe	SEM	sem	2025-09-11 07:47:37.845	2025-09-11 07:47:37.845
ef2744b8-ead3-4222-93c1-97e8597680cc	Content Strategy	content-strategy	2025-09-11 07:47:37.845	2025-09-11 07:47:37.845
0b446e68-284e-4330-9f48-f7f6de3b481d	Email Marketing	email-marketing	2025-09-11 07:47:37.846	2025-09-11 07:47:37.846
55a012c6-40b5-4749-9184-1ed723baf8a5	Social Media Marketing	social-media-marketing	2025-09-11 07:47:37.846	2025-09-11 07:47:37.846
aea103c3-92b6-422a-8e44-822ea3a62816	Analytics	analytics	2025-09-11 07:47:37.847	2025-09-11 07:47:37.847
1259fb9a-fecc-4596-8115-e46660494678	Conversion Rate Optimization	cro	2025-09-11 07:47:37.847	2025-09-11 07:47:37.847
6071d688-0007-4724-b939-0f3752a76fac	PPC	ppc	2025-09-11 07:47:37.847	2025-09-11 07:47:37.847
a3617e5b-aeb1-4166-a179-5e67981ae32b	Brand Strategy	brand-strategy	2025-09-11 07:47:37.848	2025-09-11 07:47:37.848
2d9b85f2-ce81-4446-8747-3474a866c010	Startups	startups	2025-09-11 07:47:37.848	2025-09-11 07:47:37.848
ffa8e1ed-608d-475b-bb5b-32a0001e5df3	Entrepreneurship	entrepreneurship	2025-09-11 07:47:37.849	2025-09-11 07:47:37.849
34654d4c-8b74-41ef-9c3d-0c0c1726d385	Funding	funding	2025-09-11 07:47:37.849	2025-09-11 07:47:37.849
454bc554-2dcd-4985-8fa2-f6a833c26038	Growth Hacking	growth-hacking	2025-09-11 07:47:37.85	2025-09-11 07:47:37.85
677ea744-def7-4443-8695-b328465c9fac	Remote Work	remote-work	2025-09-11 07:47:37.851	2025-09-11 07:47:37.851
734f76e5-e551-4d70-985e-6652ccabe74d	Consulting	consulting	2025-09-11 07:47:37.851	2025-09-11 07:47:37.851
078e0e66-ff2d-43c4-b644-4f6b5dec46f0	Strategy	strategy	2025-09-11 07:47:37.852	2025-09-11 07:47:37.852
8bfc6477-f17b-4ad9-9fe6-1d4ada908ae7	Human Resources	human-resources	2025-09-11 07:47:37.852	2025-09-11 07:47:37.852
b452af63-9581-4dd6-b080-ca7398bfe439	Workforce Management	workforce-management	2025-09-11 07:47:37.853	2025-09-11 07:47:37.853
1e62ea2d-ac4e-4b92-81bf-5d1f08f8b79d	Employee Scheduling	employee-scheduling	2025-09-11 07:47:37.853	2025-09-11 07:47:37.853
708cb5e1-c9e4-4969-95b8-a8df9e6746fc	Performance Analytics	performance-analytics	2025-09-11 07:47:37.853	2025-09-11 07:47:37.853
561f7f31-8c1e-403b-a165-c6538511afd6	Employee Onboarding	employee-onboarding	2025-09-11 07:47:37.854	2025-09-11 07:47:37.854
66f1e250-cbd7-4ac5-895d-ddb3097b6b33	Payroll Integration	payroll-integration	2025-09-11 07:47:37.854	2025-09-11 07:47:37.854
59be022b-388a-4f0d-8606-a82bf7d8d983	Time Tracking	time-tracking	2025-09-11 07:47:37.855	2025-09-11 07:47:37.855
912aecb2-2b66-4c69-a89c-c829c872faa4	Staff Optimization	staff-optimization	2025-09-11 07:47:37.855	2025-09-11 07:47:37.855
04227390-80f8-41cb-aef0-7d9f67f79d93	HR Automation	hr-automation	2025-09-11 07:47:37.855	2025-09-11 07:47:37.855
dbaa4fe5-aba8-46e1-876e-40923446cba0	Workforce Analytics	workforce-analytics	2025-09-11 07:47:37.856	2025-09-11 07:47:37.856
ffb1f5b8-b557-420f-b052-ef7464235479	Tutorial	tutorial	2025-09-11 07:47:37.856	2025-09-11 07:47:37.856
b063ed60-a4b8-4d82-9a25-255763b6b8dc	Guide	guide	2025-09-11 07:47:37.857	2025-09-11 07:47:37.857
09f55a25-b21c-4f8d-9fb2-51d19130d6b2	Case Study	case-study	2025-09-11 07:47:37.857	2025-09-11 07:47:37.857
5f281bcb-223f-4d35-a97c-d37717f91570	Interview	interview	2025-09-11 07:47:37.858	2025-09-11 07:47:37.858
91371474-2723-4706-944c-994afb2a8535	Opinion	opinion	2025-09-11 07:47:37.858	2025-09-11 07:47:37.858
83e43eb9-c080-4499-b61a-795784cdde0b	News	news	2025-09-11 07:47:37.858	2025-09-11 07:47:37.858
fbfedb60-054d-4c85-8fdf-4c61c6969335	AI	ai	2025-09-11 07:47:37.859	2025-09-11 07:47:37.859
9e938af1-f648-4dcf-b6a4-1139886dc400	Machine Learning	machine-learning	2025-09-11 07:47:37.859	2025-09-11 07:47:37.859
99554c7b-92e1-43f0-a20b-06037bb8f077	Blockchain	blockchain	2025-09-11 07:47:37.859	2025-09-11 07:47:37.859
f5a97c10-1950-47c7-bb6b-012c0be2a74f	Cybersecurity	cybersecurity	2025-09-11 07:47:37.86	2025-09-11 07:47:37.86
01a9dcae-1198-4b27-bd03-414cac00e273	Restaurant AI	restaurant-ai	2025-09-11 07:47:37.86	2025-09-11 07:47:37.86
55cf6d08-c7d7-4861-a21f-1f41e99d09c8	Retail Intelligence	retail-intelligence	2025-09-11 07:47:37.861	2025-09-11 07:47:37.861
8302a316-0442-4245-81f9-7810f86524d4	Healthcare AI	healthcare-ai	2025-09-11 07:47:37.861	2025-09-11 07:47:37.861
825d5dc7-d2be-41a7-add3-d1bf4e3339d0	Construction AI	construction-ai	2025-09-11 07:47:37.861	2025-09-11 07:47:37.861
d9a94873-e6ce-4ce0-882b-5cf25cc7e091	Professional Services	professional-services	2025-09-11 07:47:37.862	2025-09-11 07:47:37.862
2b080171-27cc-4094-8c0e-ebf4153a3dc0	Inventory Management	inventory-management	2025-09-11 07:47:37.862	2025-09-11 07:47:37.862
ac8a2edd-a7f0-4ac1-9e98-83ec9c9af745	Demand Forecasting	demand-forecasting	2025-09-11 07:47:37.862	2025-09-11 07:47:37.862
094f83b6-19f2-4be3-a724-de019ecd3842	Process Automation	process-automation	2025-09-11 07:47:37.863	2025-09-11 07:47:37.863
214d3542-9513-4a23-aadb-33aba00e5226	Predictive Analytics	predictive-analytics	2025-09-11 07:47:37.863	2025-09-11 07:47:37.863
e744e94e-4cf3-4c7f-a8a2-dd484a6628e0	Natural Language Processing	nlp	2025-09-11 07:47:37.863	2025-09-11 07:47:37.863
45edf213-4260-44b1-a29e-6feeaea7314c	Computer Vision	computer-vision	2025-09-11 07:47:37.864	2025-09-11 07:47:37.864
35f9000d-bc9c-41ee-8920-4600b9ed7dee	Workflow Optimization	workflow-optimization	2025-09-11 07:47:37.864	2025-09-11 07:47:37.864
0441e63e-af2e-4f80-8fab-34b7fddeb8c5	Customer Analytics	customer-analytics	2025-09-11 07:47:37.865	2025-09-11 07:47:37.865
8bb5ada5-7e88-4f9b-8665-5cbe0c750445	Resource Optimization	resource-optimization	2025-09-11 07:47:37.865	2025-09-11 07:47:37.865
efb3db91-af3d-42e5-94a0-04186a3a276c	Compliance Monitoring	compliance-monitoring	2025-09-11 07:47:37.866	2025-09-11 07:47:37.866
6c6dd069-5284-4f00-ac37-06530d1346ff	Customer Support	customer-support	2025-09-11 07:47:37.867	2025-09-11 07:47:37.867
a5a5ad73-5096-4230-bacc-3a1266cfc03b	Chatbot	chatbot	2025-09-11 07:47:37.867	2025-09-11 07:47:37.867
3becfff0-9bbf-4084-8628-e8777089399b	CRM Integration	crm-integration	2025-09-11 07:47:37.868	2025-09-11 07:47:37.868
cf1c19e5-9667-4d8d-994c-c2501f86428c	Custom Integration	custom-integration	2025-09-11 07:47:37.868	2025-09-11 07:47:37.868
ed60e29d-e9ba-4f1e-ac62-28cfba8d3e3a	Business Operations	business-operations	2025-09-11 07:47:37.868	2025-09-11 07:47:37.868
cbfb6632-476b-4b3e-85a8-7907b38aa49f	Advanced Automation	advanced-automation	2025-09-11 07:47:37.869	2025-09-11 07:47:37.869
e590b92d-f68b-4326-9ef7-61394daddc89	Enterprise AI	enterprise-ai	2025-09-11 07:47:37.869	2025-09-11 07:47:37.869
f84e49ef-f372-4473-824e-9ecf603f386d	Custom Automation	custom-automation	2025-09-11 07:47:37.869	2025-09-11 07:47:37.869
94398e14-ea79-4e04-9fea-25c71dc0c38c	Strategic Insights	strategic-insights	2025-09-11 07:47:37.87	2025-09-11 07:47:37.87
ec169a32-02a4-4734-8f24-c0b38dcbbbe9	ROI	roi	2025-09-11 07:47:37.87	2025-09-11 07:47:37.87
f1a96cff-e55b-4187-9af9-b9bf2dc63780	Unlimited	unlimited	2025-09-11 07:47:37.87	2025-09-11 07:47:37.87
1dbc2dfc-a6ea-4396-99a5-e0979bd741e0	Enterprise	enterprise	2025-09-11 07:47:37.871	2025-09-11 07:47:37.871
9b0ad408-2e2c-488a-95f3-5095f019f7f9	Web Development	web-development	2025-09-11 07:48:06.188	2025-09-11 07:48:06.188
07fa69cc-94ed-470f-839a-bba74d3354b1	Components	components	2025-09-11 07:48:06.195	2025-09-11 07:48:06.195
3195c81a-596d-4e15-9713-a46d390662de	Tailwind	tailwind	2025-09-11 07:48:06.199	2025-09-11 07:48:06.199
57b4351d-4a60-440e-974d-175bc86f270a	CSS	css	2025-09-11 07:48:06.199	2025-09-11 07:48:06.199
bec775d8-1099-442e-b586-edfddae4a9bb	Vercel	vercel	2025-09-11 07:48:06.202	2025-09-11 07:48:06.202
b3de3dfd-e0b8-42f1-a804-f24823828d55	Deployment	deployment	2025-09-11 07:48:06.203	2025-09-11 07:48:06.203
ca860d9c-5dc3-4773-ae50-ab67e780a0d0	DevOps	devops	2025-09-11 07:48:06.204	2025-09-11 07:48:06.204
cf58ac25-b57c-4107-bad4-7d1b1b7c734f	State Management	state-management	2025-09-11 07:48:06.206	2025-09-11 07:48:06.206
e33abc35-40a0-4cc9-8c71-c57faa2a54f0	Redux	redux	2025-09-11 07:48:06.207	2025-09-11 07:48:06.207
b9ff3d04-ed18-476d-b747-38b2f147a6d4	Business	business	2025-09-11 07:48:06.211	2025-09-11 07:48:06.211
8ed8d052-a249-456a-a4cd-da0926eedc19	Automation	automation	2025-09-11 07:48:06.212	2025-09-11 07:48:06.212
a4fbebcd-1db8-4590-a69c-e6ad4ab5e9bd	Firebase	firebase	2025-09-11 07:48:06.218	2025-09-11 07:48:06.218
10f2b350-2043-4fc5-9a62-0a4e5f0bb80d	Real-time	real-time	2025-09-11 07:48:06.219	2025-09-11 07:48:06.219
aa69e627-b927-4ade-ab8f-2ed966ee7150	OpenAI	openai	2025-09-11 07:48:06.222	2025-09-11 07:48:06.222
355197cf-6fae-40b9-a960-448ac4456b99	GPT	gpt	2025-09-11 07:48:06.223	2025-09-11 07:48:06.223
d32d241e-0c46-431a-b6ad-f157f59afc49	API	api	2025-09-11 07:48:06.223	2025-09-11 07:48:06.223
61d105ec-2a87-4922-8c9a-14d0753355c0	Best Practices	best-practices	2025-09-11 07:48:06.226	2025-09-11 07:48:06.226
8b030aef-0bef-4206-b59a-6b18e6515c2d	Performance	performance	2025-09-11 07:48:06.226	2025-09-11 07:48:06.226
8676d7e4-5a74-4742-a934-e7b0f61ceae3	Frontend	frontend	2025-09-11 07:48:06.228	2025-09-11 07:48:06.228
a716db62-2660-4420-83ce-b2de71d26b33	Trends	trends	2025-09-11 07:48:06.229	2025-09-11 07:48:06.229
7c21ab53-b16a-40ac-aaa5-6efb917dd71b	Tools	tools	2025-09-11 07:48:06.229	2025-09-11 07:48:06.229
fa825b5d-5f9b-457e-9004-3e976f279fa0	Authentication	authentication	2025-09-11 07:48:06.233	2025-09-11 07:48:06.233
4f2d0518-db16-46d7-ace8-1328c4c2a66e	Security	security	2025-09-11 07:48:06.234	2025-09-11 07:48:06.234
55072701-706a-4f8c-961f-0459414b1319	UX	ux	2025-09-11 07:48:06.236	2025-09-11 07:48:06.236
e997821c-5ac1-4751-9a1b-e02b4e539dee	Design	design	2025-09-11 07:48:06.237	2025-09-11 07:48:06.237
e29a33fb-9765-47d1-974d-8c6f423a41e6	RAG	rag	2025-09-11 07:48:06.24	2025-09-11 07:48:06.24
68934e28-9623-4501-9e97-f618a715386b	LangChain	langchain	2025-09-11 07:48:06.24	2025-09-11 07:48:06.24
7c955471-1420-4fcc-95f7-e275e1244cb4	Micro Frontends	micro-frontends	2025-09-11 07:48:06.243	2025-09-11 07:48:06.243
a9bcdd2d-1b6d-4f28-8fa2-66e69f9ef582	Architecture	architecture	2025-09-11 07:48:06.243	2025-09-11 07:48:06.243
543bdcb5-f3bb-4100-b117-2991fbd5b9a8	NX	nx	2025-09-11 07:48:06.244	2025-09-11 07:48:06.244
84c49a4c-1689-40c2-9378-37db18438534	Web Vitals	web-vitals	2025-09-11 07:48:06.246	2025-09-11 07:48:06.246
a92a17c4-6d5a-413d-9d1f-dfa30f2c4e81	Agent Zero	agent-zero	2025-09-11 07:49:35.836	2025-09-11 07:49:35.836
e34ba599-7cbc-42fe-be05-da6b6bd38b04	AI Agents	ai-agents	2025-09-11 07:49:35.836	2025-09-11 07:49:35.836
c5bf8499-4690-4d29-8373-def8042182fe	Workflows	workflows	2025-09-11 07:49:35.837	2025-09-11 07:49:35.837
\.


--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.testimonials (id, content, rating, "authorId", role, company, avatar, featured, published, "sortOrder", "createdAt", "updatedAt") FROM stdin;
47a2b98b-897f-4891-9968-011e9edb4f0c	Working with Astralis has been transformative for our brand. Their attention to detail and creative solutions exceeded our expectations.	5	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	CEO at TechStart	TechStart	https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80	t	t	1	2025-09-11 07:47:37.872	2025-09-11 07:47:37.872
c968f3eb-6fe3-4cd1-8ed8-8238057d5369	The team delivered exactly what we needed. Professional, timely, and always willing to go the extra mile.	5	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	Marketing Director	GrowthCorp	https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80	t	t	2	2025-09-11 07:47:37.875	2025-09-11 07:47:37.875
2b1f374e-6b9b-4414-9b17-60f43997773b	Outstanding work on our e-commerce platform. The user experience is seamless and conversion rates have improved significantly.	5	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	Founder	RetailPlus	https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80	t	t	3	2025-09-11 07:47:37.875	2025-09-11 07:47:37.875
d432e29c-7a9a-49dd-bb0d-b56b3ecdbdec	Their mobile app development expertise helped us launch our product ahead of schedule. Highly recommended!	5	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	CTO	MobileFirst	https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80	t	t	4	2025-09-11 07:47:37.875	2025-09-11 07:47:37.875
9fef9640-79b0-4916-9d4d-de852f1573ee	Exceptional SEO services that doubled our organic traffic within 6 months. The results speak for themselves.	5	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	Digital Marketing Manager	OnlineSuccess	https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80	t	t	5	2025-09-11 07:47:37.876	2025-09-11 07:47:37.876
ace7a0b4-53a3-46ec-8374-250242cf9b7e	The brand identity package was perfect for our startup. Professional design that truly represents our vision.	5	1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	Creative Director	InnovateLab	https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80	f	t	6	2025-09-11 07:47:37.876	2025-09-11 07:47:37.876
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.users (id, email, name, password, avatar, bio, role, "createdAt", "updatedAt", "additionalInfo", budget, "businessGoals", company, "interestArea", "onboardingCompleted", "teamSize", timeline) FROM stdin;
1e5e7ccb-d6e1-4a52-baed-4c8608f1ee7f	admin@astralis.one	Admin User	$2b$10$oaEpSW/1uC.xd0PwKTpYE.3Zwbc4qWdjfJdyhcK36Nfrk2jsPI6D2	\N	\N	ADMIN	2025-09-11 07:47:37.573	2025-09-11 07:47:37.573	\N	\N	\N	\N	\N	f	\N	\N
07cab0a5-faf1-4692-a82a-583fdeeb799f	admin@astralis.com	Admin User Test	$2b$10$dXemTWD7j/hJgxmTdoBocOfghZ9txD9gNzk6nuqQalXgnDJZPxwf6	\N	\N	ADMIN	2025-09-11 07:47:37.639	2025-09-11 07:47:37.639	\N	\N	\N	\N	\N	f	\N	\N
cb541e39-2bd4-4792-97ab-e20f2a0302d4	pm@astralis.com	Project Manager	$2b$10$3sCqI4MmG1KT7oIoWnp81.73XWrDc1.2LnQWi793ZHeMB89CpUzIW	\N	\N	PM	2025-09-11 07:47:37.693	2025-09-11 07:47:37.693	\N	\N	\N	\N	\N	f	\N	\N
6f81bd2b-1fda-410e-96f3-41225d1089a8	user@astralis.com	Regular User	$2b$10$ZzWNMZVFVqjYBrj3/GWcl.HpdH5FgnPRzrw3uBnxlTN5b2QJUReLG	\N	\N	USER	2025-09-11 07:47:37.747	2025-09-11 07:47:37.747	\N	\N	\N	\N	\N	f	\N	\N
042c72e0-882c-40b4-a9c8-515909eddcfa	seller@astralis.one	Sample Seller	$2b$10$Mcv/FJzXo4cK411CX2hNvOADKjUF7zABU46vOUCBMnMlyo8Mhdune	\N	\N	USER	2025-09-11 07:47:37.8	2025-09-11 07:47:37.8	\N	\N	\N	\N	\N	f	\N	\N
4bd7dbd2-eac1-4a98-84e7-f467d49325ba	user@astralisone.com	Gregory A Starr	$2b$10$ED/vML4RU2/cnSbK/esZr.wH3EbBQqCV0w8JCPrGIeq8bl6a0pGQi	\N	\N	USER	2025-09-11 07:55:52.747	2025-09-11 07:56:42.043	\N	<5k	["website-redesign","lead-generation"]	Starrit llc	e-commerce	t	1-5	3-6months
\.


--
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: gstarr
--

COPY public.wishlists (id, "userId", "itemId", "createdAt") FROM stdin;
\.


--
-- Name: AccessRequest AccessRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public."AccessRequest"
    ADD CONSTRAINT "AccessRequest_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: ClientCall ClientCall_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public."ClientCall"
    ADD CONSTRAINT "ClientCall_pkey" PRIMARY KEY (id);


--
-- Name: Company Company_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public."Company"
    ADD CONSTRAINT "Company_pkey" PRIMARY KEY (id);


--
-- Name: Contact Contact_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public."Contact"
    ADD CONSTRAINT "Contact_pkey" PRIMARY KEY (id);


--
-- Name: EngagementStakeholder EngagementStakeholder_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public."EngagementStakeholder"
    ADD CONSTRAINT "EngagementStakeholder_pkey" PRIMARY KEY (id);


--
-- Name: Engagement Engagement_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public."Engagement"
    ADD CONSTRAINT "Engagement_pkey" PRIMARY KEY (id);


--
-- Name: Environment Environment_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public."Environment"
    ADD CONSTRAINT "Environment_pkey" PRIMARY KEY (id);


--
-- Name: Milestone Milestone_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public."Milestone"
    ADD CONSTRAINT "Milestone_pkey" PRIMARY KEY (id);


--
-- Name: _MarketplaceItemToTag _MarketplaceItemToTag_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public."_MarketplaceItemToTag"
    ADD CONSTRAINT "_MarketplaceItemToTag_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _PostToTag _PostToTag_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public."_PostToTag"
    ADD CONSTRAINT "_PostToTag_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ai_optimization_reports ai_optimization_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.ai_optimization_reports
    ADD CONSTRAINT ai_optimization_reports_pkey PRIMARY KEY (id);


--
-- Name: audit_availability audit_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.audit_availability
    ADD CONSTRAINT audit_availability_pkey PRIMARY KEY (id);


--
-- Name: audit_blocked_dates audit_blocked_dates_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.audit_blocked_dates
    ADD CONSTRAINT audit_blocked_dates_pkey PRIMARY KEY (id);


--
-- Name: audit_bookings audit_bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.audit_bookings
    ADD CONSTRAINT audit_bookings_pkey PRIMARY KEY (id);


--
-- Name: audit_notifications audit_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.audit_notifications
    ADD CONSTRAINT audit_notifications_pkey PRIMARY KEY (id);


--
-- Name: audit_templates audit_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.audit_templates
    ADD CONSTRAINT audit_templates_pkey PRIMARY KEY (id);


--
-- Name: calendar_integrations calendar_integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.calendar_integrations
    ADD CONSTRAINT calendar_integrations_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: consultations consultations_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT consultations_pkey PRIMARY KEY (id);


--
-- Name: contact_forms contact_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.contact_forms
    ADD CONSTRAINT contact_forms_pkey PRIMARY KEY (id);


--
-- Name: follow_ups follow_ups_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.follow_ups
    ADD CONSTRAINT follow_ups_pkey PRIMARY KEY (id);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (id);


--
-- Name: marketplace_items marketplace_items_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.marketplace_items
    ADD CONSTRAINT marketplace_items_pkey PRIMARY KEY (id);


--
-- Name: newsletter_campaigns newsletter_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.newsletter_campaigns
    ADD CONSTRAINT newsletter_campaigns_pkey PRIMARY KEY (id);


--
-- Name: newsletter_emails newsletter_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.newsletter_emails
    ADD CONSTRAINT newsletter_emails_pkey PRIMARY KEY (id);


--
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- Name: newsletter_templates newsletter_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.newsletter_templates
    ADD CONSTRAINT newsletter_templates_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: revenue_audits revenue_audits_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.revenue_audits
    ADD CONSTRAINT revenue_audits_pkey PRIMARY KEY (id);


--
-- Name: subscriber_preferences subscriber_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.subscriber_preferences
    ADD CONSTRAINT subscriber_preferences_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wishlists wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_pkey PRIMARY KEY (id);


--
-- Name: AccessRequest_engagementId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "AccessRequest_engagementId_idx" ON public."AccessRequest" USING btree ("engagementId");


--
-- Name: AccessRequest_engagementId_status_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "AccessRequest_engagementId_status_idx" ON public."AccessRequest" USING btree ("engagementId", status);


--
-- Name: AccessRequest_status_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "AccessRequest_status_idx" ON public."AccessRequest" USING btree (status);


--
-- Name: AccessRequest_type_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "AccessRequest_type_idx" ON public."AccessRequest" USING btree (type);


--
-- Name: AuditLog_action_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "AuditLog_action_idx" ON public."AuditLog" USING btree (action);


--
-- Name: AuditLog_actorUserId_createdAt_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON public."AuditLog" USING btree ("actorUserId", "createdAt");


--
-- Name: AuditLog_actorUserId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "AuditLog_actorUserId_idx" ON public."AuditLog" USING btree ("actorUserId");


--
-- Name: AuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");


--
-- Name: AuditLog_entityId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "AuditLog_entityId_idx" ON public."AuditLog" USING btree ("entityId");


--
-- Name: AuditLog_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "AuditLog_entityType_entityId_idx" ON public."AuditLog" USING btree ("entityType", "entityId");


--
-- Name: AuditLog_entityType_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "AuditLog_entityType_idx" ON public."AuditLog" USING btree ("entityType");


--
-- Name: Company_billingEmail_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "Company_billingEmail_idx" ON public."Company" USING btree ("billingEmail");


--
-- Name: Company_createdAt_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "Company_createdAt_idx" ON public."Company" USING btree ("createdAt");


--
-- Name: Company_name_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "Company_name_idx" ON public."Company" USING btree (name);


--
-- Name: Contact_companyId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "Contact_companyId_idx" ON public."Contact" USING btree ("companyId");


--
-- Name: Contact_companyId_isPrimary_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "Contact_companyId_isPrimary_idx" ON public."Contact" USING btree ("companyId", "isPrimary");


--
-- Name: Contact_createdAt_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "Contact_createdAt_idx" ON public."Contact" USING btree ("createdAt");


--
-- Name: Contact_email_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "Contact_email_idx" ON public."Contact" USING btree (email);


--
-- Name: Contact_email_key; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE UNIQUE INDEX "Contact_email_key" ON public."Contact" USING btree (email);


--
-- Name: EngagementStakeholder_contactId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "EngagementStakeholder_contactId_idx" ON public."EngagementStakeholder" USING btree ("contactId");


--
-- Name: EngagementStakeholder_engagementId_contactId_key; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE UNIQUE INDEX "EngagementStakeholder_engagementId_contactId_key" ON public."EngagementStakeholder" USING btree ("engagementId", "contactId");


--
-- Name: EngagementStakeholder_engagementId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "EngagementStakeholder_engagementId_idx" ON public."EngagementStakeholder" USING btree ("engagementId");


--
-- Name: Engagement_companyId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "Engagement_companyId_idx" ON public."Engagement" USING btree ("companyId");


--
-- Name: Engagement_companyId_status_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "Engagement_companyId_status_idx" ON public."Engagement" USING btree ("companyId", status);


--
-- Name: Engagement_createdAt_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "Engagement_createdAt_idx" ON public."Engagement" USING btree ("createdAt");


--
-- Name: Engagement_startDate_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "Engagement_startDate_idx" ON public."Engagement" USING btree ("startDate");


--
-- Name: Engagement_status_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "Engagement_status_idx" ON public."Engagement" USING btree (status);


--
-- Name: Environment_engagementId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "Environment_engagementId_idx" ON public."Environment" USING btree ("engagementId");


--
-- Name: Environment_engagementId_name_key; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE UNIQUE INDEX "Environment_engagementId_name_key" ON public."Environment" USING btree ("engagementId", name);


--
-- Name: Environment_name_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "Environment_name_idx" ON public."Environment" USING btree (name);


--
-- Name: Milestone_dueDate_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "Milestone_dueDate_idx" ON public."Milestone" USING btree ("dueDate");


--
-- Name: Milestone_engagementId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "Milestone_engagementId_idx" ON public."Milestone" USING btree ("engagementId");


--
-- Name: Milestone_engagementId_status_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "Milestone_engagementId_status_idx" ON public."Milestone" USING btree ("engagementId", status);


--
-- Name: Milestone_status_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "Milestone_status_idx" ON public."Milestone" USING btree (status);


--
-- Name: _MarketplaceItemToTag_B_index; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "_MarketplaceItemToTag_B_index" ON public."_MarketplaceItemToTag" USING btree ("B");


--
-- Name: _PostToTag_B_index; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "_PostToTag_B_index" ON public."_PostToTag" USING btree ("B");


--
-- Name: ai_optimization_reports_createdAt_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "ai_optimization_reports_createdAt_idx" ON public.ai_optimization_reports USING btree ("createdAt");


--
-- Name: ai_optimization_reports_email_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX ai_optimization_reports_email_idx ON public.ai_optimization_reports USING btree (email);


--
-- Name: ai_optimization_reports_industry_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX ai_optimization_reports_industry_idx ON public.ai_optimization_reports USING btree (industry);


--
-- Name: ai_optimization_reports_reportSent_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "ai_optimization_reports_reportSent_idx" ON public.ai_optimization_reports USING btree ("reportSent");


--
-- Name: audit_availability_assignedToId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "audit_availability_assignedToId_idx" ON public.audit_availability USING btree ("assignedToId");


--
-- Name: audit_availability_dayOfWeek_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "audit_availability_dayOfWeek_idx" ON public.audit_availability USING btree ("dayOfWeek");


--
-- Name: audit_availability_effectiveFrom_effectiveTo_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "audit_availability_effectiveFrom_effectiveTo_idx" ON public.audit_availability USING btree ("effectiveFrom", "effectiveTo");


--
-- Name: audit_availability_isAvailable_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "audit_availability_isAvailable_idx" ON public.audit_availability USING btree ("isAvailable");


--
-- Name: audit_blocked_dates_assignedToId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "audit_blocked_dates_assignedToId_idx" ON public.audit_blocked_dates USING btree ("assignedToId");


--
-- Name: audit_blocked_dates_blockedDate_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "audit_blocked_dates_blockedDate_idx" ON public.audit_blocked_dates USING btree ("blockedDate");


--
-- Name: audit_bookings_assignedToId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "audit_bookings_assignedToId_idx" ON public.audit_bookings USING btree ("assignedToId");


--
-- Name: audit_bookings_auditType_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "audit_bookings_auditType_idx" ON public.audit_bookings USING btree ("auditType");


--
-- Name: audit_bookings_clientEmail_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "audit_bookings_clientEmail_idx" ON public.audit_bookings USING btree ("clientEmail");


--
-- Name: audit_bookings_createdAt_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "audit_bookings_createdAt_idx" ON public.audit_bookings USING btree ("createdAt");


--
-- Name: audit_bookings_scheduledDate_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "audit_bookings_scheduledDate_idx" ON public.audit_bookings USING btree ("scheduledDate");


--
-- Name: audit_bookings_status_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX audit_bookings_status_idx ON public.audit_bookings USING btree (status);


--
-- Name: audit_notifications_bookingId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "audit_notifications_bookingId_idx" ON public.audit_notifications USING btree ("bookingId");


--
-- Name: audit_notifications_scheduledFor_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "audit_notifications_scheduledFor_idx" ON public.audit_notifications USING btree ("scheduledFor");


--
-- Name: audit_notifications_sent_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX audit_notifications_sent_idx ON public.audit_notifications USING btree (sent);


--
-- Name: audit_notifications_type_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX audit_notifications_type_idx ON public.audit_notifications USING btree (type);


--
-- Name: audit_templates_auditType_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "audit_templates_auditType_idx" ON public.audit_templates USING btree ("auditType");


--
-- Name: audit_templates_isActive_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "audit_templates_isActive_idx" ON public.audit_templates USING btree ("isActive");


--
-- Name: calendar_integrations_provider_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX calendar_integrations_provider_idx ON public.calendar_integrations USING btree (provider);


--
-- Name: calendar_integrations_userId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "calendar_integrations_userId_idx" ON public.calendar_integrations USING btree ("userId");


--
-- Name: calendar_integrations_userId_provider_key; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE UNIQUE INDEX "calendar_integrations_userId_provider_key" ON public.calendar_integrations USING btree ("userId", provider);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: consultations_assignedToId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "consultations_assignedToId_idx" ON public.consultations USING btree ("assignedToId");


--
-- Name: consultations_clientEmail_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "consultations_clientEmail_idx" ON public.consultations USING btree ("clientEmail");


--
-- Name: consultations_consultationType_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "consultations_consultationType_idx" ON public.consultations USING btree ("consultationType");


--
-- Name: consultations_createdAt_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "consultations_createdAt_idx" ON public.consultations USING btree ("createdAt");


--
-- Name: consultations_scheduledAt_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "consultations_scheduledAt_idx" ON public.consultations USING btree ("scheduledAt");


--
-- Name: consultations_status_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX consultations_status_idx ON public.consultations USING btree (status);


--
-- Name: follow_ups_consultationId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "follow_ups_consultationId_idx" ON public.follow_ups USING btree ("consultationId");


--
-- Name: follow_ups_revenueAuditId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "follow_ups_revenueAuditId_idx" ON public.follow_ups USING btree ("revenueAuditId");


--
-- Name: follow_ups_scheduledAt_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "follow_ups_scheduledAt_idx" ON public.follow_ups USING btree ("scheduledAt");


--
-- Name: follow_ups_status_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX follow_ups_status_idx ON public.follow_ups USING btree (status);


--
-- Name: follow_ups_type_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX follow_ups_type_idx ON public.follow_ups USING btree (type);


--
-- Name: likes_postId_userId_key; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE UNIQUE INDEX "likes_postId_userId_key" ON public.likes USING btree ("postId", "userId");


--
-- Name: marketplace_items_paypalProductId_key; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE UNIQUE INDEX "marketplace_items_paypalProductId_key" ON public.marketplace_items USING btree ("paypalProductId");


--
-- Name: marketplace_items_slug_key; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE UNIQUE INDEX marketplace_items_slug_key ON public.marketplace_items USING btree (slug);


--
-- Name: newsletter_campaigns_createdAt_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "newsletter_campaigns_createdAt_idx" ON public.newsletter_campaigns USING btree ("createdAt");


--
-- Name: newsletter_campaigns_scheduledAt_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "newsletter_campaigns_scheduledAt_idx" ON public.newsletter_campaigns USING btree ("scheduledAt");


--
-- Name: newsletter_campaigns_sentAt_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "newsletter_campaigns_sentAt_idx" ON public.newsletter_campaigns USING btree ("sentAt");


--
-- Name: newsletter_campaigns_status_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX newsletter_campaigns_status_idx ON public.newsletter_campaigns USING btree (status);


--
-- Name: newsletter_emails_campaignId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "newsletter_emails_campaignId_idx" ON public.newsletter_emails USING btree ("campaignId");


--
-- Name: newsletter_emails_campaignId_subscriberId_key; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE UNIQUE INDEX "newsletter_emails_campaignId_subscriberId_key" ON public.newsletter_emails USING btree ("campaignId", "subscriberId");


--
-- Name: newsletter_emails_openedAt_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "newsletter_emails_openedAt_idx" ON public.newsletter_emails USING btree ("openedAt");


--
-- Name: newsletter_emails_sentAt_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "newsletter_emails_sentAt_idx" ON public.newsletter_emails USING btree ("sentAt");


--
-- Name: newsletter_emails_status_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX newsletter_emails_status_idx ON public.newsletter_emails USING btree (status);


--
-- Name: newsletter_emails_subscriberId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "newsletter_emails_subscriberId_idx" ON public.newsletter_emails USING btree ("subscriberId");


--
-- Name: newsletter_subscribers_confirmationToken_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "newsletter_subscribers_confirmationToken_idx" ON public.newsletter_subscribers USING btree ("confirmationToken");


--
-- Name: newsletter_subscribers_confirmationToken_key; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE UNIQUE INDEX "newsletter_subscribers_confirmationToken_key" ON public.newsletter_subscribers USING btree ("confirmationToken");


--
-- Name: newsletter_subscribers_createdAt_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "newsletter_subscribers_createdAt_idx" ON public.newsletter_subscribers USING btree ("createdAt");


--
-- Name: newsletter_subscribers_email_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX newsletter_subscribers_email_idx ON public.newsletter_subscribers USING btree (email);


--
-- Name: newsletter_subscribers_email_key; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE UNIQUE INDEX newsletter_subscribers_email_key ON public.newsletter_subscribers USING btree (email);


--
-- Name: newsletter_subscribers_status_confirmedAt_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "newsletter_subscribers_status_confirmedAt_idx" ON public.newsletter_subscribers USING btree (status, "confirmedAt");


--
-- Name: newsletter_subscribers_status_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX newsletter_subscribers_status_idx ON public.newsletter_subscribers USING btree (status);


--
-- Name: newsletter_subscribers_unsubscribeToken_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "newsletter_subscribers_unsubscribeToken_idx" ON public.newsletter_subscribers USING btree ("unsubscribeToken");


--
-- Name: newsletter_subscribers_unsubscribeToken_key; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE UNIQUE INDEX "newsletter_subscribers_unsubscribeToken_key" ON public.newsletter_subscribers USING btree ("unsubscribeToken");


--
-- Name: newsletter_templates_isActive_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "newsletter_templates_isActive_idx" ON public.newsletter_templates USING btree ("isActive");


--
-- Name: newsletter_templates_isDefault_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "newsletter_templates_isDefault_idx" ON public.newsletter_templates USING btree ("isDefault");


--
-- Name: order_items_marketplaceItemId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "order_items_marketplaceItemId_idx" ON public.order_items USING btree ("marketplaceItemId");


--
-- Name: order_items_orderId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "order_items_orderId_idx" ON public.order_items USING btree ("orderId");


--
-- Name: orders_createdAt_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "orders_createdAt_idx" ON public.orders USING btree ("createdAt");


--
-- Name: orders_customerEmail_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "orders_customerEmail_idx" ON public.orders USING btree ("customerEmail");


--
-- Name: orders_orderNumber_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "orders_orderNumber_idx" ON public.orders USING btree ("orderNumber");


--
-- Name: orders_orderNumber_key; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE UNIQUE INDEX "orders_orderNumber_key" ON public.orders USING btree ("orderNumber");


--
-- Name: orders_paymentStatus_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "orders_paymentStatus_idx" ON public.orders USING btree ("paymentStatus");


--
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- Name: orders_userId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "orders_userId_idx" ON public.orders USING btree ("userId");


--
-- Name: password_reset_tokens_expiresAt_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "password_reset_tokens_expiresAt_idx" ON public.password_reset_tokens USING btree ("expiresAt");


--
-- Name: password_reset_tokens_token_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX password_reset_tokens_token_idx ON public.password_reset_tokens USING btree (token);


--
-- Name: password_reset_tokens_token_key; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE UNIQUE INDEX password_reset_tokens_token_key ON public.password_reset_tokens USING btree (token);


--
-- Name: password_reset_tokens_userId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "password_reset_tokens_userId_idx" ON public.password_reset_tokens USING btree ("userId");


--
-- Name: posts_slug_key; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE UNIQUE INDEX posts_slug_key ON public.posts USING btree (slug);


--
-- Name: revenue_audits_assignedToId_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "revenue_audits_assignedToId_idx" ON public.revenue_audits USING btree ("assignedToId");


--
-- Name: revenue_audits_clientEmail_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "revenue_audits_clientEmail_idx" ON public.revenue_audits USING btree ("clientEmail");


--
-- Name: revenue_audits_createdAt_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "revenue_audits_createdAt_idx" ON public.revenue_audits USING btree ("createdAt");


--
-- Name: revenue_audits_scheduledAt_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX "revenue_audits_scheduledAt_idx" ON public.revenue_audits USING btree ("scheduledAt");


--
-- Name: revenue_audits_status_idx; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE INDEX revenue_audits_status_idx ON public.revenue_audits USING btree (status);


--
-- Name: subscriber_preferences_subscriberId_key; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE UNIQUE INDEX "subscriber_preferences_subscriberId_key" ON public.subscriber_preferences USING btree ("subscriberId");


--
-- Name: tags_name_key; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);


--
-- Name: tags_slug_key; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE UNIQUE INDEX tags_slug_key ON public.tags USING btree (slug);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: wishlists_userId_itemId_key; Type: INDEX; Schema: public; Owner: gstarr
--

CREATE UNIQUE INDEX "wishlists_userId_itemId_key" ON public.wishlists USING btree ("userId", "itemId");


--
-- Name: AccessRequest AccessRequest_engagementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public."AccessRequest"
    ADD CONSTRAINT "AccessRequest_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES public."Engagement"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Contact Contact_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public."Contact"
    ADD CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EngagementStakeholder EngagementStakeholder_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public."EngagementStakeholder"
    ADD CONSTRAINT "EngagementStakeholder_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contact"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EngagementStakeholder EngagementStakeholder_engagementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public."EngagementStakeholder"
    ADD CONSTRAINT "EngagementStakeholder_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES public."Engagement"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Engagement Engagement_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public."Engagement"
    ADD CONSTRAINT "Engagement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Environment Environment_engagementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public."Environment"
    ADD CONSTRAINT "Environment_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES public."Engagement"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Milestone Milestone_engagementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public."Milestone"
    ADD CONSTRAINT "Milestone_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES public."Engagement"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _MarketplaceItemToTag _MarketplaceItemToTag_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public."_MarketplaceItemToTag"
    ADD CONSTRAINT "_MarketplaceItemToTag_A_fkey" FOREIGN KEY ("A") REFERENCES public.marketplace_items(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _MarketplaceItemToTag _MarketplaceItemToTag_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public."_MarketplaceItemToTag"
    ADD CONSTRAINT "_MarketplaceItemToTag_B_fkey" FOREIGN KEY ("B") REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _PostToTag _PostToTag_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public."_PostToTag"
    ADD CONSTRAINT "_PostToTag_A_fkey" FOREIGN KEY ("A") REFERENCES public.posts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _PostToTag _PostToTag_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public."_PostToTag"
    ADD CONSTRAINT "_PostToTag_B_fkey" FOREIGN KEY ("B") REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_availability audit_availability_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.audit_availability
    ADD CONSTRAINT "audit_availability_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: audit_blocked_dates audit_blocked_dates_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.audit_blocked_dates
    ADD CONSTRAINT "audit_blocked_dates_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: audit_bookings audit_bookings_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.audit_bookings
    ADD CONSTRAINT "audit_bookings_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: audit_bookings audit_bookings_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.audit_bookings
    ADD CONSTRAINT "audit_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: audit_notifications audit_notifications_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.audit_notifications
    ADD CONSTRAINT "audit_notifications_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public.audit_bookings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: calendar_integrations calendar_integrations_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.calendar_integrations
    ADD CONSTRAINT "calendar_integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: comments comments_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES public.posts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: consultations consultations_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT "consultations_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: consultations consultations_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT "consultations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: follow_ups follow_ups_consultationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.follow_ups
    ADD CONSTRAINT "follow_ups_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES public.consultations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: follow_ups follow_ups_revenueAuditId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.follow_ups
    ADD CONSTRAINT "follow_ups_revenueAuditId_fkey" FOREIGN KEY ("revenueAuditId") REFERENCES public.revenue_audits(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: likes likes_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT "likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES public.posts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: likes likes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT "likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: marketplace_items marketplace_items_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.marketplace_items
    ADD CONSTRAINT "marketplace_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: marketplace_items marketplace_items_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.marketplace_items
    ADD CONSTRAINT "marketplace_items_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: newsletter_campaigns newsletter_campaigns_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.newsletter_campaigns
    ADD CONSTRAINT "newsletter_campaigns_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public.newsletter_templates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: newsletter_emails newsletter_emails_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.newsletter_emails
    ADD CONSTRAINT "newsletter_emails_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public.newsletter_campaigns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: newsletter_emails newsletter_emails_subscriberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.newsletter_emails
    ADD CONSTRAINT "newsletter_emails_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES public.newsletter_subscribers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_marketplaceItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_marketplaceItemId_fkey" FOREIGN KEY ("marketplaceItemId") REFERENCES public.marketplace_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: orders orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: password_reset_tokens password_reset_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: posts posts_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: posts posts_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT "posts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: revenue_audits revenue_audits_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.revenue_audits
    ADD CONSTRAINT "revenue_audits_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: revenue_audits revenue_audits_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.revenue_audits
    ADD CONSTRAINT "revenue_audits_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: subscriber_preferences subscriber_preferences_subscriberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.subscriber_preferences
    ADD CONSTRAINT "subscriber_preferences_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES public.newsletter_subscribers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: testimonials testimonials_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT "testimonials_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: wishlists wishlists_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT "wishlists_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public.marketplace_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: wishlists wishlists_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gstarr
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT "wishlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict qCqeOcqarap1yGLvxfKSrwG1giQW0cVT8Oa9nrhXTpwRqdw8dREGpduQ2VFhxBx

