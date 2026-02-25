import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { observationSchema } from "@/lib/validations";

// GET - Get observations for a team
export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role") || "";
    const userId = parseInt(request.headers.get("x-user-id") || "0");
    const { searchParams } = new URL(request.url);
    const teamId = parseInt(searchParams.get("teamId") || "0");

    if (!teamId) {
      return NextResponse.json({ error: "teamId is required" }, { status: 400 });
    }

    // Verify access
    if (role === "TEAM_LEADER") {
      const team = await prisma.team.findFirst({ where: { id: teamId, leaderId: userId } });
      if (!team) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    } else if (role === "COORDINATOR") {
      const team = await prisma.team.findFirst({ where: { id: teamId, coordinatorId: userId } });
      if (!team) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const observations = await prisma.observation.findMany({
      where: { teamId },
      include: { coordinator: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ observations });
  } catch (error) {
    console.error("Get observations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create observation (Coordinator only)
export async function POST(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role") || "";
    const userId = parseInt(request.headers.get("x-user-id") || "0");

    if (role !== "COORDINATOR") {
      return NextResponse.json({ error: "Only coordinators can post observations" }, { status: 403 });
    }

    const body = await request.json();
    const validation = observationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { teamId, message } = validation.data;

    // Verify coordinator is assigned to this team
    const team = await prisma.team.findFirst({
      where: { id: teamId, coordinatorId: userId },
    });
    if (!team) {
      return NextResponse.json({ error: "You are not assigned to this team" }, { status: 403 });
    }

    const observation = await prisma.observation.create({
      data: {
        teamId,
        coordinatorId: userId,
        message,
      },
      include: { coordinator: { select: { name: true } } },
    });

    return NextResponse.json({ message: "Observation posted", observation }, { status: 201 });
  } catch (error) {
    console.error("Create observation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
