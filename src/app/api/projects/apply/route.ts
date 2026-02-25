import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// POST - Team applies to a project
export async function POST(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role") || "";
    const userId = parseInt(request.headers.get("x-user-id") || "0");

    if (role !== "TEAM_LEADER") {
      return NextResponse.json({ error: "Only team leaders can apply to projects" }, { status: 403 });
    }

    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    // Get team leader's team
    const team = await prisma.team.findUnique({ where: { leaderId: userId } });
    if (!team) {
      return NextResponse.json({ error: "You need to create a team first" }, { status: 404 });
    }

    if (team.projectId) {
      return NextResponse.json({ error: "Your team is already assigned to a project" }, { status: 409 });
    }

    // Check project exists and is open
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.status !== "OPEN") {
      return NextResponse.json({ error: "Project not found or not open" }, { status: 404 });
    }

    // Apply team to project
    await prisma.team.update({
      where: { id: team.id },
      data: { projectId: project.id },
    });

    return NextResponse.json({ message: "Applied to project successfully" });
  } catch (error) {
    console.error("Apply to project error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
