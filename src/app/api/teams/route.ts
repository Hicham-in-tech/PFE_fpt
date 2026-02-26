import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { teamSchema } from "@/lib/validations";

export const dynamic = 'force-dynamic';

// GET - Fetch teams (role-based)
export async function GET(request: NextRequest) {
  try {
    const userId = parseInt(request.headers.get("x-user-id") || "0");
    const role = request.headers.get("x-user-role") || "";

    let teams;

    if (role === "TEAM_LEADER") {
      // Team leader sees only their team
      teams = await prisma.team.findMany({
        where: { leaderId: userId },
        include: {
          members: true,
          leader: { select: { id: true, name: true, email: true } },
          coordinator: { select: { id: true, name: true, email: true } },
          project: true,
          observations: {
            include: { coordinator: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    } else if (role === "COORDINATOR") {
      // Coordinator sees teams assigned to them
      teams = await prisma.team.findMany({
        where: { coordinatorId: userId },
        include: {
          members: true,
          leader: { select: { id: true, name: true, email: true } },
          coordinator: { select: { id: true, name: true, email: true } },
          project: true,
          observations: {
            include: { coordinator: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    } else if (role === "SUPER_ADMIN") {
      // Super admin sees all teams
      teams = await prisma.team.findMany({
        include: {
          members: true,
          leader: { select: { id: true, name: true, email: true } },
          coordinator: { select: { id: true, name: true, email: true } },
          project: true,
        },
      });
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ teams });
  } catch (error) {
    console.error("Get teams error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a team (Team Leader only)
export async function POST(request: NextRequest) {
  try {
    const userId = parseInt(request.headers.get("x-user-id") || "0");
    const role = request.headers.get("x-user-role") || "";

    if (role !== "TEAM_LEADER") {
      return NextResponse.json({ error: "Only team leaders can create teams" }, { status: 403 });
    }

    // Check if user already has a team
    const existingTeam = await prisma.team.findUnique({ where: { leaderId: userId } });
    if (existingTeam) {
      return NextResponse.json({ error: "You already have a team. Only one team per leader." }, { status: 409 });
    }

    const body = await request.json();
    const validation = teamSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { teamName, projectName, projectDescription } = validation.data;

    const team = await prisma.team.create({
      data: {
        teamName,
        projectName,
        projectDescription,
        projectLogo: body.projectLogo || null,
        leaderId: userId,
      },
      include: { members: true },
    });

    return NextResponse.json({ message: "Team created successfully", team }, { status: 201 });
  } catch (error) {
    console.error("Create team error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
