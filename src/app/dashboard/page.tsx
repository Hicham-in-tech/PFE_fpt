import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FolderKanban, MessageSquare, Star } from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const team = await prisma.team.findUnique({
    where: { leaderId: session.userId },
    include: {
      members: true,
      coordinator: { select: { name: true, email: true } },
      project: true,
      observations: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  });

  const statusVariant = (status: string) => {
    switch (status) {
      case "APPROVED": return "success" as const;
      case "REJECTED": return "destructive" as const;
      default: return "warning" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {session.name}</h1>
        <p className="text-muted-foreground">Team Leader Dashboard</p>
      </div>

      {!team ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              You haven&apos;t created a team yet.{" "}
              <a href="/dashboard/team" className="text-primary hover:underline font-medium">
                Create your team now
              </a>
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{team.members.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge variant={statusVariant(team.status)}>{team.status}</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Coordinator</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {team.coordinator?.name || "Not assigned"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Score</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {team.evaluationScore !== null ? `${team.evaluationScore}/20` : "N/A"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Info */}
          <Card>
            <CardHeader>
              <CardTitle>Team: {team.teamName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Project:</strong> {team.projectName}</p>
              <p><strong>Description:</strong> {team.projectDescription || "No description"}</p>
              {team.project && (
                <p><strong>Applied to Project:</strong> {team.project.title}</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Observations */}
          {team.observations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Coordinator Remarks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {team.observations.map((obs) => (
                  <div key={obs.id} className="p-3 bg-muted rounded-md">
                    <p className="text-sm">{obs.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(obs.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
