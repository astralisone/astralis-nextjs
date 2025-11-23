import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateConsultationCalendarEvent } from "@/lib/calendar";
import {
  sendEmail,
  generateCustomerConfirmationEmail,
  generateCustomerConfirmationText,
  generateInternalNotificationEmail,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { detectConflicts } from "@/lib/services/conflict.service";
import { getEventBus, getAgentInstance } from "@/lib/agent";

// Extend global type to include our custom property
declare global {
  var agentSystemInitialized: boolean | undefined;
}

/**
 * Parse time string (e.g., "09:00 AM", "02:30 PM") to 24-hour format hours and minutes
 */
function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

/**
 * Convert date string (YYYY-MM-DD) and time string ("HH:MM AM/PM") to Date objects
 * Returns startTime and endTime (1 hour duration for consultations)
 */
function createDateTimeRange(dateStr: string, timeStr: string): { startTime: Date; endTime: Date } {
  const [year, month, day] = dateStr.split("-").map(Number);
  const { hours, minutes } = parseTimeString(timeStr);

  const startTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + 1); // Default 1-hour consultation

  return { startTime, endTime };
}

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
 * Handle consultation booking submissions with conflict detection
 *
 * This endpoint:
 * 1. Validates booking data
 * 2. Checks for scheduling conflicts (if DEFAULT_USER_ID is configured)
 * 3. Creates a SchedulingEvent record for calendar management
 * 4. Generates a unique booking ID
 * 5. Creates an ICS calendar file
 * 6. Sends confirmation email to customer (with calendar attachment)
 * 7. Sends notification email to support team (with calendar attachment)
 * 8. Creates an IntakeRequest record for the intake pipeline system
 * 9. Logs the booking for tracking
 *
 * Note: Requires DEFAULT_ORG_ID environment variable for intake request creation
 * Note: Requires DEFAULT_USER_ID environment variable for conflict detection and SchedulingEvent creation
 *
 * Returns 409 Conflict if the requested time slot has scheduling conflicts
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

    // Parse date and time to create proper Date objects
    const { startTime, endTime } = createDateTimeRange(date, time);

    // Get default user ID for conflict detection and event creation
    const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID;
    let schedulingEventId: string | null = null;

    // Step 1: Check for scheduling conflicts (if DEFAULT_USER_ID is configured)
    if (DEFAULT_USER_ID) {
      // Verify user exists before checking conflicts
      const user = await prisma.users.findUnique({
        where: { id: DEFAULT_USER_ID },
        select: { id: true, name: true, email: true, isActive: true },
      });

      if (!user) {
        console.error(`[Booking] Default user not found: ${DEFAULT_USER_ID}`);
        return NextResponse.json(
          { error: "Booking system configuration error", details: "Default host user not found" },
          { status: 500 }
        );
      }

      if (!user.isActive) {
        console.error(`[Booking] Default user is inactive: ${DEFAULT_USER_ID}`);
        return NextResponse.json(
          { error: "Booking system unavailable", details: "The booking host is not accepting bookings" },
          { status: 503 }
        );
      }

      // Check for conflicts using the conflict detection service
      const conflictResult = await detectConflicts(DEFAULT_USER_ID, startTime, endTime);

      if (conflictResult.hasConflict) {
        const conflictDetails = conflictResult.conflicts.map((c) => ({
          eventId: c.eventId,
          eventTitle: c.eventTitle,
          startTime: c.startTime.toISOString(),
          endTime: c.endTime.toISOString(),
          conflictType: c.conflictType,
        }));

        const availabilityIssueDetails = conflictResult.availabilityIssues.map((a) => ({
          message: a.message,
          affectedTime: a.affectedTime,
        }));

        console.log(`[Booking] Conflict detected for ${date} at ${time}:`, {
          severity: conflictResult.severity,
          conflicts: conflictDetails,
          availabilityIssues: availabilityIssueDetails,
        });

        return NextResponse.json(
          {
            error: "Scheduling conflict detected",
            severity: conflictResult.severity,
            conflicts: conflictDetails,
            availabilityIssues: availabilityIssueDetails,
            message:
              conflictResult.severity === "high"
                ? "The requested time slot is not available. Please choose a different time."
                : "There are potential conflicts with this time slot. Please choose a different time.",
          },
          { status: 409 }
        );
      }

      // Step 2: Create SchedulingEvent record
      try {
        const schedulingEvent = await prisma.schedulingEvent.create({
          data: {
            userId: DEFAULT_USER_ID,
            title: `Consultation: ${name}${company ? ` (${company})` : ""}`,
            description: message || `${meetingType} consultation requested`,
            startTime,
            endTime,
            timezone: "America/New_York", // Default timezone for consultations
            participantEmails: [email],
            status: "SCHEDULED",
            aiSuggestionMeta: {
              guestName: name,
              guestEmail: email,
              guestPhone: phone,
              company: company || null,
              meetingType,
              bookedAt: new Date().toISOString(),
              source: "booking_modal",
            },
          },
        });

        schedulingEventId = schedulingEvent.id;
        console.log(`[Booking] SchedulingEvent created: ${schedulingEvent.id}`);

        // Create EventReminder entries (24h and 1h before)
        const now = new Date();
        const reminders = [];

        const reminder24h = new Date(startTime);
        reminder24h.setHours(reminder24h.getHours() - 24);

        const reminder1h = new Date(startTime);
        reminder1h.setHours(reminder1h.getHours() - 1);

        if (reminder24h > now) {
          reminders.push(
            prisma.eventReminder.create({
              data: {
                eventId: schedulingEvent.id,
                reminderTime: reminder24h,
                status: "PENDING",
              },
            })
          );
        }

        if (reminder1h > now) {
          reminders.push(
            prisma.eventReminder.create({
              data: {
                eventId: schedulingEvent.id,
                reminderTime: reminder1h,
                status: "PENDING",
              },
            })
          );
        }

        if (reminders.length > 0) {
          await Promise.all(reminders);
          console.log(`[Booking] Created ${reminders.length} reminders for event ${schedulingEvent.id}`);
        }
      } catch (eventError) {
        console.error("[Booking] Failed to create SchedulingEvent:", eventError);
        // Continue without SchedulingEvent - the booking can still proceed via intake
      }
    } else {
      console.warn("[Booking] DEFAULT_USER_ID not configured, skipping conflict detection and event creation");
    }

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
      schedulingEventId,
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

    // Create intake request for the booking to appear in the intake pipeline
    const DEFAULT_ORG_ID = process.env.DEFAULT_ORG_ID;
    let intakeRequestId: string | null = null;

    if (DEFAULT_ORG_ID) {
      try {
        // Verify organization exists before creating intake request
        const org = await prisma.organization.findUnique({
          where: { id: DEFAULT_ORG_ID },
        });

        if (org) {
          const intakeRequest = await prisma.intakeRequest.create({
            data: {
              source: "FORM",
              status: "NEW",
              title: `Consultation Request: ${name}`,
              description: message || `${meetingType} consultation requested for ${date} at ${time}`,
              requestData: {
                bookingId,
                name,
                email,
                phone,
                company: company || null,
                date,
                time,
                meetingType,
                message: message || null,
                formType: "booking",
                submittedAt: new Date().toISOString(),
              },
              priority: 2, // Medium priority
              orgId: DEFAULT_ORG_ID,
            },
          });

          intakeRequestId = intakeRequest.id;
          console.log(`[Booking] Intake request created: ${intakeRequest.id} for booking ${bookingId}`);

          // Emit intake:created event to trigger orchestration agent
          const eventBus = getEventBus();
          await eventBus.emit('intake:created', {
            id: intakeRequest.id,
            source: 'api',
            timestamp: new Date(),
            payload: {
              intakeId: intakeRequest.id,
              type: 'booking_request',
              data: {
                title: intakeRequest.title,
                description: intakeRequest.description,
                source: intakeRequest.source,
                status: intakeRequest.status,
                priority: intakeRequest.priority,
                requestData: intakeRequest.requestData,
              },
              contactInfo: {
                email: (intakeRequest.requestData as any)?.email,
                name: (intakeRequest.requestData as any)?.name,
                phone: (intakeRequest.requestData as any)?.phone,
              },
            },
          });

          // Ensure agent is running for this organization (if system is initialized)
          try {
            const agent = getAgentInstance(intakeRequest.orgId);
            if (!agent.isActive()) {
              agent.start();
            }
          } catch (agentError) {
            console.log('Agent not available for booking, attempting to initialize system...');
            // Try to initialize the agent system if not already done
            if (!globalThis.agentSystemInitialized) {
              try {
                const { initializeAgentSystem } = await import('@/lib/agent');
                const hasClaudeKey = !!process.env.ANTHROPIC_API_KEY;
                const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

                if (hasClaudeKey || hasOpenAIKey) {
                  await initializeAgentSystem({
                    enableWebhooks: true,
                    enableEmail: true,
                    enableDBTriggers: true,
                    enableWorkerEvents: true,
                  });
                  globalThis.agentSystemInitialized = true;
                  console.log('✅ Agent system initialized during booking processing');

                  // Now try to get the agent again
                  const agent = getAgentInstance(intakeRequest.orgId);
                  if (!agent.isActive()) {
                    agent.start();
                  }
                }
              } catch (initError) {
                console.log('Agent system initialization failed:', initError instanceof Error ? initError.message : String(initError));
              }
            }
          }
        } else {
          console.error(`[Booking] Organization not found: ${DEFAULT_ORG_ID}`);
        }
      } catch (intakeError) {
        // Log error but don't fail the booking - email/calendar is more important
        console.error("[Booking] Failed to create intake request:", intakeError);
      }
    } else {
      console.warn("[Booking] DEFAULT_ORG_ID not configured, skipping intake request creation");
    }

    return NextResponse.json(
      {
        success: true,
        bookingId,
        schedulingEventId,
        intakeRequestId,
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
