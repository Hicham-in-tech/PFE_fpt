"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, UserPlus, Pencil, Check, X } from "lucide-react";

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
  photo?: string;
}

interface Team {
  id: number;
  teamName: string;
  projectName: string;
  projectDescription?: string;
  status: string;
  members: TeamMember[];
}

// Blank member template
const blankMember = () => ({
  firstName: "", lastName: "", cin: "", cne: "",
  memberEmail: "", githubLink: "", linkedinLink: "", phoneNumber: "", photo: "",
});

export default function TeamPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // --- Create team state ---
  const [teamName, setTeamName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  // Leader's own info (becomes first member) — pre-filled from account
  const [leaderInfo, setLeaderInfo] = useState(blankMember());

  // --- Add member form ---
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [newMember, setNewMember] = useState(blankMember());

  // --- Edit member inline ---
  const [editMemberId, setEditMemberId] = useState<number | null>(null);
  const [editData, setEditData] = useState(blankMember());

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        const parts = (data.user.name as string).trim().split(" ");
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ") || "";
        setLeaderInfo((prev) => ({
          ...prev,
          firstName,
          lastName,
          memberEmail: data.user.email || "",
        }));
      }
    } catch {
      // silently ignore
    }
  };

  const fetchTeam = async () => {
    try {
      const res = await fetch("/api/teams");
      const data = await res.json();
      if (data.teams && data.teams.length > 0) {
        setTeam(data.teams[0]);
      }
    } catch {
      setError("Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchTeam(); fetchCurrentUser(); }, []);

  // Single-step: create team AND add leader as first member
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaderInfo.firstName.trim() || !leaderInfo.lastName.trim()) {
      setError("First and last name are required for the leader member entry.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      // 1. Create the team
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName, projectName, projectDescription }),
      });
      if (res.status === 401) { window.location.href = "/login"; return; }
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }

      // 2. Add leader as first member
      await fetch("/api/teams/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: leaderInfo.firstName, lastName: leaderInfo.lastName,
          cin: leaderInfo.cin, cne: leaderInfo.cne,
          email: leaderInfo.memberEmail, githubLink: leaderInfo.githubLink,
          linkedinLink: leaderInfo.linkedinLink, phoneNumber: leaderInfo.phoneNumber,
          photo: leaderInfo.photo,
        }),
      });

      // Reset
      setTeamName(""); setProjectName(""); setProjectDescription("");
      setLeaderInfo(blankMember());
      await fetchTeam();
    } catch {
      setError("Failed to create team");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/teams/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: newMember.firstName, lastName: newMember.lastName,
          cin: newMember.cin, cne: newMember.cne,
          email: newMember.memberEmail, githubLink: newMember.githubLink,
          linkedinLink: newMember.linkedinLink, phoneNumber: newMember.phoneNumber,
          photo: newMember.photo,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      await fetchTeam();
      setNewMember(blankMember());
      setShowMemberForm(false);
    } catch {
      setError("Failed to add member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    if (!confirm("Remove this member?")) return;
    try {
      const res = await fetch(`/api/teams/members?id=${memberId}`, { method: "DELETE" });
      if (res.ok) await fetchTeam();
      else setError("Failed to remove member");
    } catch {
      setError("Failed to remove member");
    }
  };

  const startEdit = (m: TeamMember) => {
    setEditMemberId(m.id);
    setEditData({
      firstName: m.firstName, lastName: m.lastName,
      cin: m.cin || "", cne: m.cne || "",
      memberEmail: m.email || "", githubLink: m.githubLink || "",
      linkedinLink: m.linkedinLink || "", phoneNumber: m.phoneNumber || "",
      photo: m.photo || "",
    });
  };

  const handleSaveEdit = async (memberId: number) => {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/teams/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          firstName: editData.firstName, lastName: editData.lastName,
          cin: editData.cin, cne: editData.cne,
          email: editData.memberEmail, githubLink: editData.githubLink,
          linkedinLink: editData.linkedinLink, phoneNumber: editData.phoneNumber,
          photo: editData.photo,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setEditMemberId(null);
      await fetchTeam();
    } catch {
      setError("Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-12">Loading...</div>;

  // ── MEMBER FIELD COMPONENT ──
  const MemberFields = ({
    data, onChange,
  }: {
    data: ReturnType<typeof blankMember>;
    onChange: (key: string, val: string) => void;
  }) => {
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) { alert("Image must be under 2MB"); return; }
      const reader = new FileReader();
      reader.onloadend = () => onChange("photo", reader.result as string);
      reader.readAsDataURL(file);
    };
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: "firstName", label: "First Name *", required: true },
            { key: "lastName", label: "Last Name *", required: true },
            { key: "cin", label: "CIN" },
            { key: "cne", label: "CNE" },
            { key: "memberEmail", label: "Email", type: "email" },
            { key: "phoneNumber", label: "Phone" },
            { key: "githubLink", label: "GitHub", placeholder: "https://github.com/..." },
            { key: "linkedinLink", label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
          ].map(({ key, label, required, type, placeholder }) => (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <Input
                type={type || "text"}
                required={required}
                placeholder={placeholder}
                value={(data as Record<string, string>)[key]}
                onChange={(e) => onChange(key, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Label>Member Photo</Label>
          <div className="flex items-center gap-4">
            {data.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.photo} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-fpt-blue flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[10px] text-center flex-shrink-0">No photo</div>
            )}
            <div>
              <Input type="file" accept="image/*" onChange={handlePhotoChange} className="cursor-pointer" />
              <p className="text-xs text-muted-foreground mt-1">Optional · JPEG/PNG · max 2MB</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Team</h1>
        <p className="text-muted-foreground">Manage your team and members</p>
      </div>

      {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}

      {/* ── CREATE TEAM ── */}
      {!team && (
        <Card>
          <CardHeader>
            <CardTitle>Create Your Team</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTeam} className="space-y-6">
              {/* Team & project info */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Team & Project</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Team Name *</Label>
                    <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Project Name *</Label>
                    <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Project Description</Label>
                  <Textarea value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} />
                </div>
              </div>

              {/* Leader personal info */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Your Info (Leader)</h4>
                <MemberFields
                  data={leaderInfo}
                  onChange={(key, val) => setLeaderInfo((prev) => ({ ...prev, [key]: val }))}
                />
              </div>

              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Team"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── TEAM INFO ── */}
      {team && (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{team.teamName}</h2>
                  <p className="text-muted-foreground">{team.projectName}</p>
                  {team.projectDescription && <p className="text-sm mt-1">{team.projectDescription}</p>}
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  team.status === "APPROVED" ? "bg-green-100 text-green-700" :
                  team.status === "REJECTED" ? "bg-red-100 text-red-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>{team.status}</span>
              </div>
            </CardContent>
          </Card>

          {/* ── MEMBERS TABLE ── */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team Members ({team.members.length})</CardTitle>
              <Button size="sm" onClick={() => { setShowMemberForm(!showMemberForm); setNewMember(blankMember()); }}>
                <UserPlus className="h-4 w-4 mr-2" /> Add Member
              </Button>
            </CardHeader>
            <CardContent>
              {/* Add member form */}
              {showMemberForm && (
                <form onSubmit={handleAddMember} className="mb-6 p-4 border rounded-md space-y-4">
                  <h4 className="font-medium">New Member</h4>
                  <MemberFields
                    data={newMember}
                    onChange={(key, val) => setNewMember((prev) => ({ ...prev, [key]: val }))}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add Member"}</Button>
                    <Button type="button" variant="outline" onClick={() => setShowMemberForm(false)}>Cancel</Button>
                  </div>
                </form>
              )}

              {team.members.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No members yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>CIN</TableHead>
                        <TableHead>CNE</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>GitHub</TableHead>
                        <TableHead>LinkedIn</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {team.members.map((member, i) => (
                        editMemberId === member.id ? (
                          // ── EDIT ROW ──
                          <TableRow key={member.id} className="bg-blue-50">
                            <TableCell>{i + 1}</TableCell>
                            <TableCell colSpan={7}>
                              <div className="space-y-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                                  <Input placeholder="First Name *" required value={editData.firstName} onChange={(e) => setEditData(p => ({ ...p, firstName: e.target.value }))} />
                                  <Input placeholder="Last Name *" required value={editData.lastName} onChange={(e) => setEditData(p => ({ ...p, lastName: e.target.value }))} />
                                  <Input placeholder="CIN" value={editData.cin} onChange={(e) => setEditData(p => ({ ...p, cin: e.target.value }))} />
                                  <Input placeholder="CNE" value={editData.cne} onChange={(e) => setEditData(p => ({ ...p, cne: e.target.value }))} />
                                  <Input placeholder="Email" type="email" value={editData.memberEmail} onChange={(e) => setEditData(p => ({ ...p, memberEmail: e.target.value }))} />
                                  <Input placeholder="Phone" value={editData.phoneNumber} onChange={(e) => setEditData(p => ({ ...p, phoneNumber: e.target.value }))} />
                                  <Input placeholder="GitHub" value={editData.githubLink} onChange={(e) => setEditData(p => ({ ...p, githubLink: e.target.value }))} />
                                  <Input placeholder="LinkedIn" value={editData.linkedinLink} onChange={(e) => setEditData(p => ({ ...p, linkedinLink: e.target.value }))} />
                                </div>
                                <div className="flex items-center gap-3 pt-1">
                                  <Label className="text-xs whitespace-nowrap text-slate-600">Update Photo:</Label>
                                  {editData.photo && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={editData.photo} alt="" className="w-8 h-8 rounded-full object-cover border" />
                                  )}
                                  <Input type="file" accept="image/*" className="h-7 text-xs cursor-pointer" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    if (file.size > 2 * 1024 * 1024) { alert("Max 2MB"); return; }
                                    const reader = new FileReader();
                                    reader.onloadend = () => setEditData(p => ({ ...p, photo: reader.result as string }));
                                    reader.readAsDataURL(file);
                                  }} />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button size="icon" variant="ghost" className="text-green-600" onClick={() => handleSaveEdit(member.id)} disabled={submitting}>
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => setEditMemberId(null)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          // ── NORMAL ROW ──
                          <TableRow key={member.id}>
                            <TableCell>{i + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {member.photo ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={member.photo} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 border" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-500 flex-shrink-0">
                                    {member.firstName[0]}{member.lastName[0]}
                                  </div>
                                )}
                                <span className="font-medium">{member.firstName} {member.lastName}</span>
                              </div>
                            </TableCell>
                            <TableCell>{member.cin || "—"}</TableCell>
                            <TableCell>{member.cne || "—"}</TableCell>
                            <TableCell>{member.email || "—"}</TableCell>
                            <TableCell>{member.phoneNumber || "—"}</TableCell>
                            <TableCell>
                              {member.githubLink ? <a href={member.githubLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">GitHub</a> : "—"}
                            </TableCell>
                            <TableCell>
                              {member.linkedinLink ? <a href={member.linkedinLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">LinkedIn</a> : "—"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => startEdit(member)} className="text-blue-600 hover:text-blue-700">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteMember(member.id)} className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}