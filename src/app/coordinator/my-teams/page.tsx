"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Team {
  id: number;
  teamName: string;
  projectName: string;
  status: string;
  evaluationScore: number | null;
  leader: { name: string; email: string };
  members: { id: number; firstName: string; lastName: string }[];
}

export default function MyTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch("/api/teams");
        const data = await res.json();
        setTeams(data.teams || []);
      } catch {
        console.error("Failed to load teams");
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  if (loading) return <div className="flex items-center justify-center p-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Teams</h1>
        <p className="text-muted-foreground">Teams assigned to you</p>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No teams assigned to you yet. Browse All Teams to accept teams.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{team.teamName}</CardTitle>
                  <Badge variant={team.status === "APPROVED" ? "success" : "warning"}>
                    {team.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Project:</strong> {team.projectName}</div>
                  <div><strong>Leader:</strong> {team.leader.name}</div>
                  <div><strong>Score:</strong> {team.evaluationScore !== null ? `${team.evaluationScore}/20` : "Not evaluated"}</div>
                  <div><strong>Members:</strong> {team.members.length}</div>
                </div>
                {team.members.length > 0 && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {team.members.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell>{member.firstName} {member.lastName}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
