"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Observation {
  id: number;
  message: string;
  createdAt: string;
  coordinator: { name: string; email: string };
}

export default function RemarksPage() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First get team
        const teamRes = await fetch("/api/teams");
        const teamData = await teamRes.json();
        if (teamData.teams && teamData.teams.length > 0) {
          const tid = teamData.teams[0].id;
          setTeamId(tid);
          // Then get observations
          const obsRes = await fetch(`/api/observations?teamId=${tid}`);
          const obsData = await obsRes.json();
          setObservations(obsData.observations || []);
        }
      } catch {
        console.error("Failed to load remarks");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center p-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Coordinator Remarks</h1>
        <p className="text-muted-foreground">Observations from your coordinator</p>
      </div>

      {!teamId ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Create a team first to see remarks.
          </CardContent>
        </Card>
      ) : observations.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No observations yet from your coordinator.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {observations.map((obs) => (
            <Card key={obs.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{obs.coordinator.name}</CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {new Date(obs.createdAt).toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{obs.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
