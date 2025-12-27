"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Server, Monitor, Box, ArrowRight } from "lucide-react";

interface StatusLog {
  id: string;
  entity_type: "server" | "vm" | "worker";
  entity_id: string;
  old_status: string;
  new_status: string;
  message: string;
  created_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function ActivityPage() {
  const [logs, setLogs] = useState<StatusLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${API_BASE}/status-logs/?limit=100`);
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLogs();
    setIsRefreshing(false);
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "server":
        return <Server className="h-4 w-4" />;
      case "vm":
        return <Monitor className="h-4 w-4" />;
      case "worker":
        return <Box className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/20 animate-pulse flex items-center justify-center">
            <div className="h-6 w-6 rounded-full bg-primary animate-ping" />
          </div>
          <p className="text-muted-foreground">Loading activity...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        title="Activity Log"
        subtitle="Recent status changes and events"
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="p-6">
        {logs.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Activity className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Activity Yet</h3>
            <p className="text-muted-foreground">
              Status changes will appear here as they happen
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log, i) => (
              <Card
                key={log.id}
                className="glass animate-fade-in"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        {getEntityIcon(log.entity_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">
                            {log.entity_type}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {log.entity_id.slice(0, 8)}...
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={log.old_status} />
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <StatusBadge status={log.new_status} />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(log.created_at)}
                      </p>
                      {log.message && (
                        <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                          {log.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

