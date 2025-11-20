import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  password: z.string().min(8),
  role: z.enum(["USER", "AUTHOR", "EDITOR", "ADMIN", "PM", "OPERATOR", "CLIENT"]).optional(),
  orgId: z.string().optional(),
});

export async function GET() {
  const users = await prisma.users.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const user = await prisma.users.create({ data: parsed.data });
  return NextResponse.json(user, { status: 201 });
}
