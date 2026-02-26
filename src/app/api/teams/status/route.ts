import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = 'force-dynamic';

// PATCH - Update team status (Coordinator / Super Admin)
export async function PATCH(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role") || "";
    const userId = parseInt(request.headers.get("x-user-id") || "0");

    if (role !== "COORDINATOR" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { teamId, status } = body;

    if (!teamId || !status) {
      return NextResponse.json({ error: "teamId and status are required" }, { status: 400 });
    }

    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { status };

    // When coordinator approves, assign themselves
    if (role === "COORDINATOR" && status === "APPROVED") {
      updateData.coordinatorId = userId;
    }

    const team = await prisma.team.update({
      where: { id: teamId },
      data: updateData,
    });

    return NextResponse.json({ message: "Team status updated", team });
  } catch (error) {
    console.error("Update team status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
