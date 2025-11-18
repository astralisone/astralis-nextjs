import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateConsultationCalendarEvent } from "@/lib/calendar";
import {
  sendEmail,
  generateCustomerConfirmationEmail,
  generateCustomerConfirmationText,
  generateInternalNotificationEmail,
} from "@/lib/email";

const bookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  company: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  meetingType: z.enum(["VIDEO_CALL", "PHONE_CALL", "IN_PERSON"]),
  message: z.string().optional(),
});

/**
 * POST /api/booking
 * Handle consultation booking submissions
 *
 * This endpoint:
 * 1. Validates booking data
 * 2. Generates a unique booking ID
 * 3. Creates an ICS calendar file
 * 4. Sends confirmation email to customer (with calendar attachment)
 * 5. Sends notification email to support team (with calendar attachment)
 * 6. Logs the booking for tracking
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid booking data",
          details: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { name, email, phone, company, date, time, meetingType, message } = parsed.data;

    // Generate a unique booking ID
    const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const bookingData = {
      bookingId,
      name,
      email,
      phone,
      company,
      date,
      time,
      meetingType,
      message,
    };

    // Log the booking
    console.log("New booking received:", {
      ...bookingData,
      timestamp: new Date().toISOString(),
    });

    // Generate calendar event ICS file
    const calendarEvent = await generateConsultationCalendarEvent({
      name,
      email,
      company,
      date,
      time,
      meetingType,
      message,
    });

    // Send confirmation email to customer
    try {
      await sendEmail({
        to: email,
        subject: `Consultation Confirmed - ${date} at ${time}`,
        html: generateCustomerConfirmationEmail(bookingData),
        text: generateCustomerConfirmationText(bookingData),
        attachments: [
          {
            filename: 'consultation.ics',
            content: calendarEvent,
            contentType: 'text/calendar',
          },
        ],
      });
      console.log(`Confirmation email sent to ${email}`);
    } catch (emailError) {
      console.error("Failed to send customer confirmation email:", emailError);
      // Continue processing even if email fails
    }

    // Send notification email to support team
    try {
      await sendEmail({
        to: 'support@astralisone.com',
        subject: `🔔 New Booking: ${name} - ${date} at ${time}`,
        html: generateInternalNotificationEmail(bookingData),
        attachments: [
          {
            filename: 'consultation.ics',
            content: calendarEvent,
            contentType: 'text/calendar',
          },
        ],
      });
      console.log("Internal notification email sent to support@astralisone.com");
    } catch (emailError) {
      console.error("Failed to send internal notification email:", emailError);
      // Continue processing even if email fails
    }

    // TODO: Store in database for persistence
    // await prisma.booking.create({
    //   data: {
    //     bookingId,
    //     name,
    //     email,
    //     phone,
    //     company,
    //     date,
    //     time,
    //     meetingType,
    //     message,
    //     status: 'CONFIRMED',
    //     createdAt: new Date(),
    //   },
    // });

    return NextResponse.json(
      {
        success: true,
        bookingId,
        message: "Booking confirmed! Check your email for details and calendar invite.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing booking:", error);
    return NextResponse.json(
      {
        error: "Failed to process booking. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
