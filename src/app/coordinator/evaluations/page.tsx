"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface Team {
  id: number;
  teamName: string;
  projectName: string;
  evaluationScore: number | null;
  leader: { name: string };
  members: { id: number }[];
}

export default function EvaluationsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);
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

  const handleEvaluate = async (teamId: number) => {
    const rawScore = scores[teamId];
    if (!rawScore || rawScore.trim() === "") {
      setError("Please enter a score before submitting");
      return;
    }
    const score = parseFloat(rawScore);
    if (isNaN(score) || score < 0 || score > 20) {
      setError("Score must be a number between 0 and 20");
      return;
    }
    setError("");
    setSuccess("");
    setSubmitting(teamId);
    try {
      const res = await fetch("/api/teams/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, score }),
      });
      const data = await res.json();
      if (res.status === 401) { window.location.href = "/login"; return; }
      if (!res.ok) { setError(data.error); return; }
      setScores((prev) => ({ ...prev, [teamId]: "" }));
      setSuccess("Score saved successfully!");
      await fetchTeams();
    } catch {
      setError("Failed to update score");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Evaluations</h1>
        <p className="text-muted-foreground">Give evaluation scores to your teams</p>
      </div>

      {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md border border-green-200">{success}</div>}

      {teams.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">No teams to evaluate.</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{team.teamName}</CardTitle>
                  <p className="text-sm text-muted-foreground">Leader: {team.leader.name}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-lg font-bold">
                    {team.evaluationScore !== null ? `${team.evaluationScore}/20` : "N/A"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">Project: {team.projectName} &bull; {team.members.length} members</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    placeholder="Score (0-20)"
                    value={scores[team.id] || ""}
                    onChange={(e) => setScores({ ...scores, [team.id]: e.target.value })}
                    className="w-32"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleEvaluate(team.id)}
                    disabled={submitting === team.id || !scores[team.id]?.trim()}
                  >
                    {submitting === team.id ? "Saving..." : team.evaluationScore !== null ? "Update Score" : "Give Score"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
