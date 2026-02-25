"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface Team {
  id: number;
  teamName: string;
  leader: { name: string };
  observations: { id: number; message: string; createdAt: string }[];
}

export default function ObservationsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

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

  useEffect(() => { fetchTeams(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/observations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: selectedTeam, message }),
      });
      const data = await res.json();
      if (res.status === 401) { window.location.href = "/login"; return; }
      if (!res.ok) { setError(data.error); return; }
      setMessage("");
      setSelectedTeam(null);
      setSuccess("Observation posted successfully!");
      await fetchTeams();
    } catch {
      setError("Failed to post observation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Observations</h1>
        <p className="text-muted-foreground">Post observations for your teams</p>
      </div>

      {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md border border-green-200">{success}</div>}

      <Card>
        <CardHeader><CardTitle>Post New Observation</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Select Team</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedTeam ?? ""}
                onChange={(e) => setSelectedTeam(e.target.value ? Number(e.target.value) : null)}
                required
              >
                <option value="">Choose a team...</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.teamName} - {team.leader.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Observation Message</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="Write your observation..." />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Posting..." : "Post Observation"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing observations per team */}
      {teams.map((team) => (
        team.observations && team.observations.length > 0 && (
          <Card key={team.id}>
            <CardHeader>
              <CardTitle className="text-lg">{team.teamName} - Observations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {team.observations.map((obs) => (
                <div key={obs.id} className="p-3 bg-muted rounded-md">
                  <p className="text-sm">{obs.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(obs.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      ))}
    </div>
  );
}
