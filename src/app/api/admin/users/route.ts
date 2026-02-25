import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET - Get all users (Super Admin only)
export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role") || "";
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
