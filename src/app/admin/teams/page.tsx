"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, MessageSquare, CheckCircle, XCircle, Trash2 } from "lucide-react";

interface TeamMember {
  id: number;
  firstName: string;
  lastName: string;
  cin?: string;
  cne?: string;
  email?: string;
  githubLink?: string;
  linkedinLink?: string;
  phoneNumber?: string;
}

interface Team {
  id: number;
  teamName: string;
  projectName: string;
  projectDescription?: string;
  status: string;
  evaluationScore: number | null;
  leader: { id: number; name: string; email: string };
  coordinator: { name: string } | null;
  members: TeamMember[];
}

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [viewTeam, setViewTeam] = useState<Team | null>(null);
  const [msgTeam, setMsgTeam] = useState<Team | null>(null);
  const [msgText, setMsgText] = useState("");
  const [msgSending, setMsgSending] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [deleteTeam, setDeleteTeam] = useState<Team | null>(null);

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/teams/all");
      const data = await res.json();
      setTeams(data.teams || []);
    } catch {
      console.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchTeams(); }, []);

  const handleStatus = async (teamId: number, status: string) => {
    if (actionLoading) return;
    setActionLoading(teamId);
    setError("");
    try {
      const res = await fetch("/api/teams/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, status }),
      });
      if (res.ok) await fetchTeams();
      else { const d = await res.json(); setError(d.error || "Failed"); }
    } catch {
      setError("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTeam || actionLoading) return;
    setActionLoading(deleteTeam.id);
    setError("");
    try {
      const res = await fetch(`/api/teams/${deleteTeam.id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); return; }
      setDeleteTeam(null);
      await fetchTeams();
    } catch {
      setError("Failed to delete team");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendMessage = async () => {
    if (!msgTeam || !msgText.trim() || msgSending) return;
    setMsgSending(true);
    setMsgSuccess("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: msgTeam.id, message: msgText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to send"); return; }
      setMsgText("");
      setMsgSuccess("Message sent!");
      setTimeout(() => { setMsgTeam(null); setMsgSuccess(""); }, 1500);
    } catch {
      setError("Failed to send message");
    } finally {
      setMsgSending(false);
    }
  };

  const statusVariant = (status: string) => {
    if (status === "APPROVED") return "success" as const;
    if (status === "REJECTED") return "destructive" as const;
    return "warning" as const;
  };

  if (loading) return <div className="flex items-center justify-center p-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">All Teams</h1>
        <p className="text-muted-foreground">Manage all teams — view details, approve, reject, message, or delete</p>
      </div>

      {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}

      <Card>
        <CardHeader><CardTitle>Teams ({teams.length})</CardTitle></CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No teams found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Leader</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Coordinator</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="min-w-[280px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell className="font-medium">{team.teamName}</TableCell>
                      <TableCell>{team.projectName}</TableCell>
                      <TableCell>
                        <div>{team.leader.name}</div>
                        <div className="text-xs text-muted-foreground">{team.leader.email}</div>
                      </TableCell>
                      <TableCell>{team.members.length}</TableCell>
                      <TableCell>{team.coordinator?.name || <span className="italic text-muted-foreground">None</span>}</TableCell>
                      <TableCell>{team.evaluationScore !== null ? `${team.evaluationScore}/20` : "—"}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(team.status)}>{team.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Button size="sm" variant="outline" onClick={() => setViewTeam(team)}>
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setMsgTeam(team); setMsgText(""); setMsgSuccess(""); }}>
                            <MessageSquare className="h-3.5 w-3.5 mr-1" /> Message
                          </Button>
                          {team.status !== "APPROVED" && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                              disabled={actionLoading === team.id}
                              onClick={() => handleStatus(team.id, "APPROVED")}>
                              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                            </Button>
                          )}
                          {team.status !== "REJECTED" && (
                            <Button size="sm" variant="destructive"
                              disabled={actionLoading === team.id}
                              onClick={() => handleStatus(team.id, "REJECTED")}>
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                            </Button>
                          )}
                          {team.status === "APPROVED" && (
                            <Button size="sm" variant="destructive"
                              disabled={actionLoading === team.id}
                              onClick={() => setDeleteTeam(team)}>
                              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── VIEW DETAIL MODAL ── */}
      {viewTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold">{viewTeam.teamName}</h2>
                <p className="text-muted-foreground">{viewTeam.projectName}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={statusVariant(viewTeam.status)}>{viewTeam.status}</Badge>
                <Button variant="ghost" size="sm" onClick={() => setViewTeam(null)}>✕ Close</Button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold">Leader:</span> {viewTeam.leader.name} ({viewTeam.leader.email})</div>
                <div><span className="font-semibold">Coordinator:</span> {viewTeam.coordinator?.name || "Not assigned"}</div>
                {viewTeam.projectDescription && (
                  <div className="col-span-2"><span className="font-semibold">Description:</span> {viewTeam.projectDescription}</div>
                )}
                {viewTeam.evaluationScore !== null && (
                  <div><span className="font-semibold">Score:</span> {viewTeam.evaluationScore}/20</div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Team Members ({viewTeam.members.length})</h3>
                {viewTeam.members.length === 0 ? (
                  <p className="text-muted-foreground italic">No members added yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Full Name</TableHead>
                          <TableHead>CIN</TableHead>
                          <TableHead>CNE</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>GitHub</TableHead>
                          <TableHead>LinkedIn</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewTeam.members.map((m, i) => (
                          <TableRow key={m.id}>
                            <TableCell>{i + 1}</TableCell>
                            <TableCell className="font-medium">{m.firstName} {m.lastName}</TableCell>
                            <TableCell>{m.cin || "—"}</TableCell>
                            <TableCell>{m.cne || "—"}</TableCell>
                            <TableCell>{m.email || "—"}</TableCell>
                            <TableCell>{m.phoneNumber || "—"}</TableCell>
                            <TableCell>{m.githubLink ? <a href={m.githubLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">GitHub</a> : "—"}</TableCell>
                            <TableCell>{m.linkedinLink ? <a href={m.linkedinLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">LinkedIn</a> : "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MESSAGE MODAL ── */}
      {msgTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Message — {msgTeam.teamName}</h2>
              <Button variant="ghost" size="sm" onClick={() => setMsgTeam(null)}>✕</Button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Send a message to <strong>{msgTeam.teamName}</strong> about their application for <strong>{msgTeam.projectName}</strong>.
              </p>
              {msgSuccess && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md">{msgSuccess}</div>}
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea rows={5} placeholder="Write your message here..." value={msgText} onChange={(e) => setMsgText(e.target.value)} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setMsgTeam(null)}>Cancel</Button>
                <Button onClick={handleSendMessage} disabled={!msgText.trim() || msgSending}>
                  {msgSending ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-destructive">Delete Team</h2>
              <p className="text-sm text-muted-foreground">
                Permanently delete <strong>{deleteTeam.teamName}</strong>? All members, observations and messages will be removed.
                The team leader can create a new team and apply to another project.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDeleteTeam(null)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={actionLoading === deleteTeam.id}>
                  {actionLoading === deleteTeam.id ? "Deleting..." : "Yes, Delete"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

