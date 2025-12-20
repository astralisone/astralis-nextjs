import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";

/**
 * GET /api/dashboard/charts/document-processing
 *
 * Returns time-series data for document processing trends
 * Shows document uploads and processing completion over time
 *
 * @param range - Time range: '7d', '30d', '90d', '1y' (default: '30d')
 * @returns Array of data points with date, uploaded, and processed counts
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

    switch (range) {
      case '7d':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
    }

    // Query document data grouped by date using raw SQL for proper date truncation
    const documentTrends = await prisma.$queryRawUnsafe<Array<{ date: string; uploaded: bigint; processed: bigint }>>(
      `
      WITH uploads AS (
        SELECT DATE("createdAt") as d, COUNT(*) as c
        FROM "Document"
        WHERE "orgId" = $1 AND "createdAt" >= $2
        GROUP BY DATE("createdAt")
      ),
      completions AS (
        SELECT DATE("updatedAt") as d, COUNT(*) as c
        FROM "Document"
        WHERE "orgId" = $1 AND "status" = 'COMPLETED' AND "updatedAt" >= $2
        GROUP BY DATE("updatedAt")
      )
      SELECT 
        COALESCE(u.d, c.d)::text as date,
        COALESCE(u.c, 0) as uploaded,
        COALESCE(c.c, 0) as processed
      FROM uploads u
      FULL OUTER JOIN completions c ON u.d = c.d
      ORDER BY date ASC
      `,
      orgId,
      startDate
    );

    // Create record for fast lookup
    const dailyData: Record<string, { uploaded: number; processed: number }> = {};
    documentTrends.forEach((item) => {
      dailyData[item.date] = {
        uploaded: Number(item.uploaded),
        processed: Number(item.processed),
      };
    });

    // Fill in missing dates and create result
    const result = [];
    const currentDate = new Date(startDate);

    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        uploaded: dailyData[dateStr]?.uploaded || 0,
        processed: dailyData[dateStr]?.processed || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Document processing chart error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch document processing data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}