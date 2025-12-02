import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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
