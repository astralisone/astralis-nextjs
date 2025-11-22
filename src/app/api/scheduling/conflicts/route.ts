import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import * as conflictService from "@/lib/services/conflict.service";
import { z } from "zod";

// Conflict check validation schema
const conflictCheckSchema = z.object({
  startTime: z.string().datetime("Invalid start time format"),
  endTime: z.string().datetime("Invalid end time format"),
  participantEmails: z.array(z.string().email()).optional().default([]),
  excludeEventId: z.string().optional(),
});

/**
 * POST /api/scheduling/conflicts
 * Checks for scheduling conflicts
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse and validate request body
    const body = await req.json();
    const result = conflictCheckSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { startTime, endTime, participantEmails, excludeEventId } = result.data;

    // Convert date strings to Date objects
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    // Validate that end time is after start time
    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Detect conflicts for the user
    const userConflicts = await conflictService.detectConflicts(
      userId,
      startDate,
      endDate
    );

    // Detect conflicts for participants if provided
    let participantConflicts: Array<{
      email: string;
      conflicts: any[];
    }> = [];

    // Note: Participant conflict detection requires user lookup by email
    // For now, return empty conflicts for external participants
    if (participantEmails.length > 0) {
      participantConflicts = participantEmails.map((email) => ({
        email,
        conflicts: [], // Conflict detection for external participants not yet implemented
      }));
    }

    // Calculate conflict summary
    const hasConflicts = userConflicts.hasConflict ||
      participantConflicts.some(p => p.conflicts.length > 0);

    const totalConflicts = userConflicts.conflicts.length +
      participantConflicts.reduce((sum, p) => sum + p.conflicts.length, 0);

    return NextResponse.json(
      {
        success: true,
        data: {
          hasConflicts,
          totalConflicts,
          userConflicts: userConflicts.conflicts,
          participantConflicts,
          timeSlot: {
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
          },
        },
        message: hasConflicts
          ? `Found ${totalConflicts} conflict${totalConflicts !== 1 ? 's' : ''}`
          : "No conflicts detected",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking conflicts:", error);

    // Handle specific error cases
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        {
          error: "User or participant not found",
          details: error.message,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to check conflicts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
