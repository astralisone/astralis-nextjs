import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createPipelineSchema = z.object({
  name: z.string().min(2),
  orgId: z.string(),
});

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("orgId");
  const where = orgId ? { orgId } : {};
  const pipelines = await prisma.pipeline.findMany({
    where,
    include: { stages: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(pipelines);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createPipelineSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const pipeline = await prisma.pipeline.create({
    data: {
      name: parsed.data.name,
      orgId: parsed.data.orgId,
    },
  });

  return NextResponse.json(pipeline, { status: 201 });
}
