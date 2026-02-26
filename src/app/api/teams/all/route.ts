import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = 'force-dynamic';

// GET all teams (for coordinators to browse)
export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role") || "";

    if (role !== "COORDINATOR" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const teams = await prisma.team.findMany({
      include: {
        members: true,
        leader: { select: { id: true, name: true, email: true } },
        coordinator: { select: { id: true, name: true, email: true } },
        project: true,
      },
    });

    return NextResponse.json({ teams });
  } catch (error) {
    console.error("Get all teams error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
