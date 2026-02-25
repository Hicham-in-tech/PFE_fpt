"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: number;
  title: string;
  description?: string;
  status: string;
  creator: { name: string };
  _count?: { teams: number };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState<number | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        setProjects(data.projects || []);
      } catch {
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleApply = async (projectId: number) => {
    setApplying(projectId);
    setError("");
    try {
      const res = await fetch("/api/projects/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      alert("Applied successfully!");
    } catch {
      setError("Failed to apply");
    } finally {
      setApplying(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Available Projects</h1>
        <p className="text-muted-foreground">Browse and apply to coordinator projects</p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>
      )}

      {projects.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No open projects available at the moment.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <Badge variant={project.status === "OPEN" ? "success" : "secondary"}>
                    {project.status}
                  </Badge>
                </div>
                <CardDescription>By {project.creator.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{project.description || "No description"}</p>
                {project._count && (
                  <p className="text-xs text-muted-foreground">{project._count.teams} team(s) applied</p>
                )}
                {project.status === "OPEN" && (
                  <Button
                    size="sm"
                    onClick={() => handleApply(project.id)}
                    disabled={applying === project.id}
                  >
                    {applying === project.id ? "Applying..." : "Apply to Project"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
