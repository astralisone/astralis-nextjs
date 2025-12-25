import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import { quotaService } from "@/lib/services/quota.service";

/**
 * GET /api/dashboard/quota
 *
 * Fetches current organization quota usage and limits
 * Used for business capacity monitoring in the Command Center
 */
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.users.findUnique({
            where: { email: session.user.email },
            select: { orgId: true },
        });

        if (!user || !user.orgId) {
            return NextResponse.json({ error: "Org context not found" }, { status: 404 });
        }

        const usage = await quotaService.getAllUsage(user.orgId);
        const warnings = await quotaService.checkQuotaWarnings(user.orgId);

        // Transform for chart consumption
        const chartData = Object.entries(usage).map(([key, value]) => ({
            resource: key.charAt(0).toUpperCase() + key.slice(1),
            current: value.current,
            limit: value.limit === -1 ? value.current * 1.5 : value.limit, // For visualization if unlimited
            isUnlimited: value.limit === -1,
            percentage: value.limit === -1 ? 0 : Math.round((value.current / value.limit) * 100)
        }));

        return NextResponse.json({ usage, chartData, warnings }, { status: 200 });
    } catch (error) {
        console.error("Quota fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
