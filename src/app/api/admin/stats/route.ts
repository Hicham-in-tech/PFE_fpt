import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = 'force-dynamic';

// GET - System overview stats (Super Admin only)
export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role") || "";
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [totalUsers, totalTeams, totalProjects, totalCoordinators, totalTeamLeaders] =
      await Promise.all([
        prisma.user.count(),
        prisma.team.count(),
        prisma.project.count(),
        prisma.user.count({ where: { role: "COORDINATOR" } }),
        prisma.user.count({ where: { role: "TEAM_LEADER" } }),
      ]);

    const teamsByStatus = await prisma.team.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const projectsByStatus = await prisma.project.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalTeams,
        totalProjects,
        totalCoordinators,
        totalTeamLeaders,
        teamsByStatus,
        projectsByStatus,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
