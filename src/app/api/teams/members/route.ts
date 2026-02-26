import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { teamMemberSchema } from "@/lib/validations";

// PUT - Edit an existing member
export async function PUT(request: NextRequest) {
  try {
    const userId = parseInt(request.headers.get("x-user-id") || "0");
    const role = request.headers.get("x-user-role") || "";

    if (role !== "TEAM_LEADER") {
      return NextResponse.json({ error: "Only team leaders can edit members" }, { status: 403 });
    }

    const team = await prisma.team.findUnique({ where: { leaderId: userId } });
    if (!team) {
      return NextResponse.json({ error: "You don't have a team yet" }, { status: 404 });
    }

    const body = await request.json();
    const { memberId, ...rest } = body;

    if (!memberId) {
      return NextResponse.json({ error: "memberId is required" }, { status: 400 });
    }

    const validation = teamMemberSchema.safeParse(rest);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const existing = await prisma.teamMember.findFirst({ where: { id: memberId, teamId: team.id } });
    if (!existing) {
      return NextResponse.json({ error: "Member not found in your team" }, { status: 404 });
    }

    const updated = await prisma.teamMember.update({
      where: { id: memberId },
      data: {
        firstName: validation.data.firstName,
        lastName: validation.data.lastName,
        cin: validation.data.cin || null,
        cne: validation.data.cne || null,
        email: validation.data.email || null,
        githubLink: validation.data.githubLink || null,
        linkedinLink: validation.data.linkedinLink || null,
        phoneNumber: validation.data.phoneNumber || null,
        ...(validation.data.photo ? { photo: validation.data.photo } : {}),
      },
    });

    return NextResponse.json({ message: "Member updated successfully", member: updated });
  } catch (error) {
    console.error("Edit member error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Add a member to a team
export async function POST(request: NextRequest) {
  try {
    const userId = parseInt(request.headers.get("x-user-id") || "0");
    const role = request.headers.get("x-user-role") || "";

    if (role !== "TEAM_LEADER") {
      return NextResponse.json({ error: "Only team leaders can add members" }, { status: 403 });
    }

    // Get the team leader's team
    const team = await prisma.team.findUnique({ where: { leaderId: userId } });
    if (!team) {
      return NextResponse.json({ error: "You don't have a team yet" }, { status: 404 });
    }

    const body = await request.json();
    const validation = teamMemberSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId: team.id,
        firstName: validation.data.firstName,
        lastName: validation.data.lastName,
        cin: validation.data.cin || null,
        cne: validation.data.cne || null,
        email: validation.data.email || null,
        githubLink: validation.data.githubLink || null,
        linkedinLink: validation.data.linkedinLink || null,
        phoneNumber: validation.data.phoneNumber || null,
        photo: validation.data.photo || null,
      },
    });

    return NextResponse.json({ message: "Member added successfully", member }, { status: 201 });
  } catch (error) {
    console.error("Add member error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Remove a member
export async function DELETE(request: NextRequest) {
  try {
    const userId = parseInt(request.headers.get("x-user-id") || "0");
    const role = request.headers.get("x-user-role") || "";
    const { searchParams } = new URL(request.url);
    const memberId = parseInt(searchParams.get("id") || "0");

    if (role !== "TEAM_LEADER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Verify member belongs to the leader's team
    const team = await prisma.team.findUnique({ where: { leaderId: userId } });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const member = await prisma.teamMember.findFirst({
      where: { id: memberId, teamId: team.id },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found in your team" }, { status: 404 });
    }

    await prisma.teamMember.delete({ where: { id: memberId } });

    return NextResponse.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Delete member error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
