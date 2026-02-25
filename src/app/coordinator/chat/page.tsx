"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";

interface Message {
  id: number;
  message: string;
  createdAt: string;
  sender: { id: number; name: string; role: string };
}

interface Team {
  id: number;
  teamName: string;
  leader: { name: string };
}

export default function CoordinatorChatPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch("/api/teams");
        const data = await res.json();
        setTeams(data.teams || []);
        if (data.teams && data.teams.length > 0) {
          setSelectedTeamId(data.teams[0].id);
        }
      } catch {
        console.error("Failed to load teams");
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  const fetchMessages = async () => {
    if (!selectedTeamId) return;
    try {
      const res = await fetch(`/api/messages?teamId=${selectedTeamId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      console.error("Failed to load messages");
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeamId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTeamId) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: selectedTeamId, message: newMessage }),
      });
      if (res.ok) {
        setNewMessage("");
        await fetchMessages();
      }
    } catch {
      console.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chat</h1>
        <p className="text-muted-foreground">Communicate with team leaders</p>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No teams assigned yet.
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-4" style={{ height: "calc(100vh - 220px)" }}>
          {/* Team list sidebar */}
          <Card className="w-64 flex flex-col">
            <CardHeader className="border-b py-3">
              <CardTitle className="text-sm">Teams</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-2">
              {teams.map((team) => (
                <button
                  key={team.id}
                  className={`w-full text-left p-3 rounded-md text-sm transition-colors ${
                    selectedTeamId === team.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedTeamId(team.id)}
                >
                  <p className="font-medium">{team.teamName}</p>
                  <p className="text-xs opacity-70">{team.leader.name}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Chat area */}
          <Card className="flex-1 flex flex-col">
            <CardHeader className="border-b py-3">
              <CardTitle className="text-sm">
                {teams.find((t) => t.id === selectedTeamId)?.teamName || "Select a team"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No messages yet.</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender.role === "COORDINATOR" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.sender.role === "COORDINATOR"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-xs font-medium mb-1 opacity-70">{msg.sender.name}</p>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </CardContent>
            <div className="border-t p-4">
              <form onSubmit={handleSend} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending || !selectedTeamId}
                />
                <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
