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

    // Get document data grouped by date
    const uploadedData = await prisma.document.groupBy({
      by: ['createdAt'],
      where: {
        orgId,
        createdAt: { gte: startDate },
      },
      _count: true,
      orderBy: { createdAt: 'asc' },
    });

    const processedData = await prisma.document.groupBy({
      by: ['updatedAt'],
      where: {
        orgId,
        status: 'COMPLETED',
        updatedAt: { gte: startDate },
      },
      _count: true,
      orderBy: { updatedAt: 'asc' },
    });

    // Group by date
    const dailyUploaded: Record<string, number> = {};
    const dailyProcessed: Record<string, number> = {};

    uploadedData.forEach((item) => {
      const date = item.createdAt.toISOString().split('T')[0];
      dailyUploaded[date] = (dailyUploaded[date] || 0) + item._count;
    });

    processedData.forEach((item) => {
      const date = item.updatedAt.toISOString().split('T')[0];
      dailyProcessed[date] = (dailyProcessed[date] || 0) + item._count;
    });

    // Fill in missing dates and create result
    const result = [];
    const currentDate = new Date(startDate);

    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        uploaded: dailyUploaded[dateStr] || 0,
        processed: dailyProcessed[dateStr] || 0,
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