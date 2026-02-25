import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderKanban, Eye, Star } from "lucide-react";

export default async function CoordinatorDashboard() {
  const session = await getSession();
  if (!session) return null;

  const [myTeams, myProjects, totalObservations] = await Promise.all([
    prisma.team.count({ where: { coordinatorId: session.userId } }),
    prisma.project.count({ where: { createdBy: session.userId } }),
    prisma.observation.count({ where: { coordinatorId: session.userId } }),
  ]);

  const recentTeams = await prisma.team.findMany({
    where: { coordinatorId: session.userId },
    include: {
      leader: { select: { name: true } },
      members: true,
    },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {session.name}</h1>
        <p className="text-muted-foreground">Coordinator Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myTeams}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Observations</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalObservations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentTeams.length > 0
                ? (() => {
                    const scored = recentTeams.filter((t) => t.evaluationScore !== null);
                    if (scored.length === 0) return "N/A";
                    const avg = scored.reduce((sum, t) => sum + (t.evaluationScore || 0), 0) / scored.length;
                    return `${avg.toFixed(1)}/20`;
                  })()
                : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Teams</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTeams.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No teams assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {recentTeams.map((team) => (
                <div key={team.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{team.teamName}</p>
                    <p className="text-sm text-muted-foreground">
                      Leader: {team.leader.name} &bull; {team.members.length} members
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{team.projectName}</p>
                    <p className="text-xs text-muted-foreground">{team.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
