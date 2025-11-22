import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { queueIntakeRouting } from "@/workers/queues/intakeRouting.queue";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

/**
 * POST /api/contact
 * Handle contact form submissions
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid form data",
          details: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { name, email, company, phone, subject, message } = parsed.data;

    // Log the contact form submission
    console.log("Contact form submission:", {
      name,
      email,
      company,
      subject,
      message,
      timestamp: new Date().toISOString(),
    });

    // Get default organization ID for public form submissions
    const DEFAULT_ORG_ID = process.env.DEFAULT_ORG_ID;

    if (!DEFAULT_ORG_ID) {
      console.warn("[Contact] DEFAULT_ORG_ID not configured, skipping intake request creation");
      return NextResponse.json(
        {
          success: true,
          message: "Thank you for contacting us! We'll get back to you within 24 hours.",
        },
        { status: 200 }
      );
    }

    // Verify organization exists
    const org = await prisma.organization.findUnique({
      where: { id: DEFAULT_ORG_ID },
    });

    if (!org) {
      console.error(`[Contact] Organization not found: ${DEFAULT_ORG_ID}`);
      // Still return success to user - don't expose internal configuration issues
      return NextResponse.json(
        {
          success: true,
          message: "Thank you for contacting us! We'll get back to you within 24 hours.",
        },
        { status: 200 }
      );
    }

    // Create intake request for AI routing
    const intakeRequest = await prisma.intakeRequest.create({
      data: {
        source: "FORM",
        status: "NEW",
        title: `Contact Form: ${subject}`,
        description: message,
        requestData: {
          name,
          email,
          phone: phone || null,
          company: company || null,
          formType: "contact",
          submittedAt: new Date().toISOString(),
        },
        priority: 2,
        orgId: DEFAULT_ORG_ID,
      },
    });

    console.log(`[Contact] Intake request created: ${intakeRequest.id}`);

    // Queue for AI routing (wrap in try-catch to not fail the request if queueing fails)
    try {
      await queueIntakeRouting({
        intakeRequestId: intakeRequest.id,
        orgId: DEFAULT_ORG_ID,
        source: "FORM",
        title: `Contact Form: ${subject}`,
        description: message,
        requestData: {
          name,
          email,
          phone,
          company,
          formType: "contact",
          submittedAt: new Date().toISOString(),
        },
        priority: 2,
      });
      console.log(`[Contact] Intake request queued for routing: ${intakeRequest.id}`);
    } catch (queueError) {
      // Log the error but don't fail the request - the intake request is already created
      console.error("[Contact] Failed to queue intake for routing:", queueError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for contacting us! We'll get back to you within 24 hours.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
