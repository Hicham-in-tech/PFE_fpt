"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KeyRound, Eye, EyeOff, Check, X } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Which user row is open for password change
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successId, setSuccessId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        setUsers(data.users || []);
      } catch {
        console.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const openEdit = (id: number) => {
    setEditingId(id);
    setNewPassword("");
    setShowPw(false);
    setErrorMsg("");
    setSuccessId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewPassword("");
    setErrorMsg("");
  };

  const handleSave = async (userId: number) => {
    if (!newPassword) { setErrorMsg("Enter a new password"); return; }
    setSaving(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || "Failed"); return; }
      setSuccessId(userId);
      setEditingId(null);
      setNewPassword("");
      setTimeout(() => setSuccessId(null), 3000);
    } catch {
      setErrorMsg("Network error");
    } finally {
      setSaving(false);
    }
  };

  const roleVariant = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN": return "destructive" as const;
      case "COORDINATOR": return "default" as const;
      default: return "secondary" as const;
    }
  };

  if (loading) return <div className="flex items-center justify-center p-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">All Users</h1>
        <p className="text-muted-foreground">Manage system users and reset passwords</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Password</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-muted-foreground">{user.id}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleVariant(user.role)}>
                        {user.role.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {editingId === user.id ? (
                        <div className="flex items-center gap-2 min-w-[260px]">
                          <div className="relative flex-1">
                            <Input
                              type={showPw ? "text" : "password"}
                              placeholder="New password (min 6)"
                              value={newPassword}
                              onChange={(e) => { setNewPassword(e.target.value); setErrorMsg(""); }}
                              className={`pr-8 h-8 text-sm ${errorMsg ? "border-red-500" : ""}`}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => setShowPw(v => !v)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                          <Button
                            size="sm"
                            className="h-8 px-2 bg-fpt-green hover:bg-fpt-green/90"
                            onClick={() => handleSave(user.id)}
                            disabled={saving}
                          >
                            <Check size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2"
                            onClick={cancelEdit}
                            disabled={saving}
                          >
                            <X size={14} />
                          </Button>
                          {errorMsg && <span className="text-xs text-red-500 whitespace-nowrap">{errorMsg}</span>}
                        </div>
                      ) : successId === user.id ? (
                        <span className="flex items-center gap-1 text-sm text-fpt-green font-medium">
                          <Check size={14} /> Password updated
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1"
                          onClick={() => openEdit(user.id)}
                        >
                          <KeyRound size={13} />
                          Change
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

