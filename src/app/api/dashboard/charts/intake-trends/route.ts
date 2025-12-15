import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";

/**
 * GET /api/dashboard/charts/intake-trends
 *
 * Returns time-series data for intake trends over time
 * Supports different time ranges and grouping intervals
 *
 * @param range - Time range: '7d', '30d', '90d', '1y' (default: '30d')
 * @returns Array of data points with date and count
 */
export async function GET(req: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    // Get user with org context
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { id: true, orgId: true },
    });

    if (!user || !user.orgId) {
      return NextResponse.json(
        { error: "User not found or not associated with an organization" },
        { status: 404 }
      );
    }

    const orgId = user.orgId;
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let groupBy: string;

    switch (range) {
      case '7d':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        groupBy = 'day';
        break;
      case '30d':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        groupBy = 'day';
        break;
      case '90d':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 90);
        groupBy = 'week';
        break;
      case '1y':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        groupBy = 'month';
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        groupBy = 'day';
    }

    // Build the query based on grouping
    let dateFormat: string;
    let groupClause: string;

    if (groupBy === 'day') {
      dateFormat = "DATE(createdAt)";
      groupClause = "DATE(createdAt)";
    } else if (groupBy === 'week') {
      dateFormat = "DATE_TRUNC('week', createdAt)";
      groupClause = "DATE_TRUNC('week', createdAt)";
    } else {
      dateFormat = "DATE_TRUNC('month', createdAt)";
      groupClause = "DATE_TRUNC('month', createdAt)";
    }

    // Query intake data grouped by time period
    const intakeData = await prisma.$queryRaw<Array<{ date: string | Date; count: bigint }>>`
      SELECT
        ${dateFormat} as date,
        COUNT(*) as count
      FROM "intakeRequest"
      WHERE "orgId" = ${orgId}
        AND "createdAt" >= ${startDate}
      GROUP BY ${groupClause}
      ORDER BY date ASC
    `;

    // Convert BigInt to number and format dates
    const formattedData = intakeData.map(item => {
      try {
        // Handle date conversion based on PostgreSQL return type
        let dateValue: string;

        if (typeof item.date === 'string') {
          // DATE() function returns string - use as-is (YYYY-MM-DD format)
          dateValue = item.date;
        } else if (item.date instanceof Date) {
          // DATE_TRUNC() returns Date object - convert to YYYY-MM-DD format
          dateValue = item.date.toISOString().split('T')[0];
        } else {
          // Fallback for unexpected types - try to convert
          dateValue = new Date(item.date as any).toISOString().split('T')[0];
        }

        return {
          date: dateValue,
          value: Number(item.count),
          label: `${Number(item.count)} intake${Number(item.count) !== 1 ? 's' : ''}`,
        };
      } catch (error) {
        console.error('Date conversion error in intake trends:', error, 'Raw item:', item);
        // Return a fallback entry with current date if conversion fails
        return {
          date: new Date().toISOString().split('T')[0],
          value: 0,
          label: 'Error processing data',
        };
      }
    });

    // Fill in missing dates with zero values
    const result = [];
    let currentDate = new Date(startDate);

    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existingData = formattedData.find(d => d.date === dateStr);

      result.push({
        date: dateStr,
        value: existingData ? existingData.value : 0,
        label: existingData ? existingData.label : '0 intakes',
      });

      // Increment date based on grouping
      if (groupBy === 'day') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (groupBy === 'week') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Dashboard intake trends error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch intake trends",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}