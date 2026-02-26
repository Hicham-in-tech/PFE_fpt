import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { evaluationSchema } from "@/lib/validations";

export const dynamic = 'force-dynamic';

// POST - Give evaluation score
export async function POST(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role") || "";
    const userId = parseInt(request.headers.get("x-user-id") || "0");

    if (role !== "COORDINATOR" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const validation = evaluationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { teamId, score } = validation.data;

    // Verify coordinator is assigned to this team
    if (role === "COORDINATOR") {
      const team = await prisma.team.findFirst({
        where: { id: teamId, coordinatorId: userId },
      });
      if (!team) {
        return NextResponse.json({ error: "You are not assigned to this team" }, { status: 403 });
      }
    }

    const team = await prisma.team.update({
      where: { id: teamId },
      data: { evaluationScore: score },
    });

    return NextResponse.json({ message: "Evaluation score updated", team });
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
