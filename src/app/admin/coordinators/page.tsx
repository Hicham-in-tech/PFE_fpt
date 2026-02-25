"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateCoordinatorPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/coordinators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess(`Coordinator "${data.user.name}" created successfully!`);
      setName("");
      setEmail("");
      setPassword("");
    } catch {
      setError("Failed to create coordinator");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Coordinator</h1>
        <p className="text-muted-foreground">Add a new coordinator to the system</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>New Coordinator Account</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">{error}</div>}
          {success && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Professor Name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="professor@university.ac.ma" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Minimum 6 characters" />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Coordinator"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
