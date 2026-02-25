import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { createCoordinatorSchema } from "@/lib/validations";

// POST - Create a coordinator (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role") || "";
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createCoordinatorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "COORDINATOR",
      },
    });

    return NextResponse.json(
      {
        message: "Coordinator created successfully",
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create coordinator error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
