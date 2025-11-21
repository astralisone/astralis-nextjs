import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createOrgSchema = z.object({
  name: z.string().min(2),
});

const orgFiltersSchema = z.object({
  search: z.string().optional().nullable(),
  limit: z.string().optional().nullable(),
  offset: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const filters = {
      search: searchParams.get("search"),
      limit: searchParams.get("limit"),
      offset: searchParams.get("offset"),
    };

    const parsed = orgFiltersSchema.safeParse(filters);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid filters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { search, limit: limitStr, offset: offsetStr } = parsed.data;
    const limit = parseInt(limitStr || "50");
    const offset = parseInt(offsetStr || "0");

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const orgs = await prisma.organization.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    return NextResponse.json(orgs);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createOrgSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const org = await prisma.organization.create({ data: parsed.data });
  return NextResponse.json(org, { status: 201 });
}
