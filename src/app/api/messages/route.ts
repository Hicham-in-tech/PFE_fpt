import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { messageSchema } from "@/lib/validations";

export const dynamic = 'force-dynamic';

// GET - Get messages for a team
export async function GET(request: NextRequest) {
  try {
    const userId = parseInt(request.headers.get("x-user-id") || "0");
    const role = request.headers.get("x-user-role") || "";
    const { searchParams } = new URL(request.url);
    const teamId = parseInt(searchParams.get("teamId") || "0");

    if (!teamId) {
      return NextResponse.json({ error: "teamId is required" }, { status: 400 });
    }

    // Verify access
    if (role === "TEAM_LEADER") {
      const team = await prisma.team.findFirst({ where: { id: teamId, leaderId: userId } });
      if (!team) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    } else if (role === "COORDINATOR") {
      const team = await prisma.team.findFirst({ where: { id: teamId, coordinatorId: userId } });
      if (!team) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { teamId },
      include: { sender: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Send a message
export async function POST(request: NextRequest) {
  try {
    const userId = parseInt(request.headers.get("x-user-id") || "0");
    const role = request.headers.get("x-user-role") || "";

    if (role !== "TEAM_LEADER" && role !== "COORDINATOR" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const validation = messageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { teamId, message } = validation.data;

    // Verify access: leader must own team, SUPER_ADMIN can message any team
    if (role === "TEAM_LEADER") {
      const team = await prisma.team.findFirst({ where: { id: teamId, leaderId: userId } });
      if (!team) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    } else if (role === "COORDINATOR") {
      // Coordinator can message any team (to notify before or after approval)
      const team = await prisma.team.findFirst({ where: { id: teamId } });
      if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
    } else if (role === "SUPER_ADMIN") {
      const team = await prisma.team.findFirst({ where: { id: teamId } });
      if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const newMessage = await prisma.message.create({
      data: { teamId, senderId: userId, message },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
