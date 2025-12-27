"use client";

import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";
import { Worker } from "@/lib/api";
import {
  Box,
  Play,
  Square,
  RotateCw,
  FileText,
  Cpu,
  Clock,
  Server,
  Monitor,
} from "lucide-react";

interface WorkerCardProps {
  worker: Worker;
  onStart?: (id: string) => void;
  onStop?: (id: string) => void;
  onRestart?: (id: string) => void;
  onViewLogs?: (id: string) => void;
}

export function WorkerCard({
  worker,
  onStart,
  onStop,
  onRestart,
  onViewLogs,
}: WorkerCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: () => Promise<any> | void) => {
    setIsLoading(true);
    try {
      await action();
    } finally {
      setIsLoading(false);
    }
  };

  const formatUptime = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const isRunning = worker.status === "running";

  return (
    <Card
      className={cn(
        "glass transition-all duration-300 hover:border-primary/50",
        isRunning && "border-l-4 border-l-success",
        worker.status === "failed" && "border-l-4 border-l-destructive",
        worker.status === "paused" && "border-l-4 border-l-warning"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              isRunning ? "bg-success/10" : "bg-muted"
            )}>
              <Box className={cn(
                "h-5 w-5",
                isRunning ? "text-success" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <h4 className="font-semibold truncate max-w-[200px]">{worker.name}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {worker.host_type === "vm" ? (
                  <Monitor className="h-3 w-3" />
                ) : (
                  <Server className="h-3 w-3" />
                )}
                <span>{worker.host_name}</span>
              </div>
            </div>
          </div>
          <StatusBadge status={worker.status} pulse={isRunning} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">CPU:</span>
            <span className="font-mono">
              {worker.cpu_usage !== null ? `${worker.cpu_usage.toFixed(1)}%` : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Uptime:</span>
            <span className="font-mono">{formatUptime(worker.uptime_seconds)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 font-mono truncate">
          <span className="bg-muted px-2 py-1 rounded">
            {worker.container_id?.slice(0, 12) || "No container"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isRunning && worker.status !== "installing" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction(() => onStart?.(worker.id))}
              disabled={isLoading}
              className="flex-1 text-success hover:text-success hover:bg-success/10"
            >
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
          )}
          {isRunning && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction(() => onStop?.(worker.id))}
                disabled={isLoading}
                className="flex-1 text-warning hover:text-warning hover:bg-warning/10"
              >
                <Square className="h-4 w-4 mr-1" />
                Stop
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction(() => onRestart?.(worker.id))}
                disabled={isLoading}
                className="flex-1"
              >
                <RotateCw className={cn("h-4 w-4 mr-1", isLoading && "animate-spin")} />
                Restart
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewLogs?.(worker.id)}
            disabled={isLoading}
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

