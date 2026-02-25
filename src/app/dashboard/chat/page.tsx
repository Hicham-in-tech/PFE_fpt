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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [teamId, setTeamId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    try {
      const teamRes = await fetch("/api/teams");
      const teamData = await teamRes.json();
      if (teamData.teams && teamData.teams.length > 0) {
        const tid = teamData.teams[0].id;
        setTeamId(tid);
        const msgRes = await fetch(`/api/messages?teamId=${tid}`);
        const msgData = await msgRes.json();
        setMessages(msgData.messages || []);
      }
    } catch {
      console.error("Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !teamId) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, message: newMessage }),
      });
      if (res.ok) {
        setNewMessage("");
        await fetchData();
      }
    } catch {
      console.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-12">Loading...</div>;

  if (!teamId) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Chat</h1>
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Create a team and get assigned a coordinator to start chatting.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chat</h1>
        <p className="text-muted-foreground">Communicate with your coordinator</p>
      </div>

      <Card className="flex flex-col" style={{ height: "calc(100vh - 220px)" }}>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Team Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender.role === "TEAM_LEADER" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.sender.role === "TEAM_LEADER"
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
              disabled={sending}
            />
            <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
