import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
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

    const { name, email, company, subject, message } = parsed.data;

    // TODO: Send email notification (using SendGrid, Postmark, etc.)
    // For now, log the contact form submission
    console.log("Contact form submission:", {
      name,
      email,
      company,
      subject,
      message,
      timestamp: new Date().toISOString(),
    });

    // TODO: Store in database if needed
    // await prisma.contactSubmission.create({ data: { ... } });

    // TODO: Send notification email to support@astralisone.com
    // await sendContactNotificationEmail({ name, email, company, subject, message });

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
