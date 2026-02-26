import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { projectSchema } from "@/lib/validations";

export const dynamic = 'force-dynamic';

// GET - Fetch projects
export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role") || "";
    const userId = parseInt(request.headers.get("x-user-id") || "0");

    let projects;

    if (role === "COORDINATOR") {
      projects = await prisma.project.findMany({
        where: { createdBy: userId },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          teams: {
            include: {
              leader: { select: { id: true, name: true, email: true } },
              members: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "TEAM_LEADER") {
      // Team leaders see OPEN projects they can apply to
      projects = await prisma.project.findMany({
        where: { status: "OPEN" },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          _count: { select: { teams: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Super admin sees all
      projects = await prisma.project.findMany({
        include: {
          creator: { select: { id: true, name: true, email: true } },
          teams: {
            include: {
              leader: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a project (Coordinator only)
export async function POST(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role") || "";
    const userId = parseInt(request.headers.get("x-user-id") || "0");

    if (role !== "COORDINATOR") {
      return NextResponse.json({ error: "Only coordinators can create projects" }, { status: 403 });
    }

    const body = await request.json();
    const validation = projectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        title: validation.data.title,
        description: validation.data.description || null,
        createdBy: userId,
      },
    });

    return NextResponse.json({ message: "Project created successfully", project }, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
