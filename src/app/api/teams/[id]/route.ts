import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = 'force-dynamic';

// DELETE - Remove a team (Coordinator who owns it, or Super Admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = request.headers.get("x-user-role") || "";
    const userId = parseInt(request.headers.get("x-user-id") || "0");
    const { id } = await params;
    const teamId = parseInt(id);

    if (role !== "COORDINATOR" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Coordinator can only delete their own assigned teams
    if (role === "COORDINATOR" && team.coordinatorId !== userId) {
      return NextResponse.json({ error: "You can only delete your own teams" }, { status: 403 });
    }

    // Delete cascades to members, observations, messages via schema
    await prisma.team.delete({ where: { id: teamId } });

    return NextResponse.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Delete team error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
