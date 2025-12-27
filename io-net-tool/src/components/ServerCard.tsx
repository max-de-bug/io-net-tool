"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";
import { Server } from "@/lib/api";
import {
  Server as ServerIcon,
  HardDrive,
  Cpu,
  MemoryStick,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Network,
  Clock,
} from "lucide-react";

interface ServerCardProps {
  server: Server;
  onRefresh?: (id: string) => void;
  onDelete?: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export function ServerCard({
  server,
  onRefresh,
  onDelete,
  isSelected,
  onSelect,
}: ServerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsLoading(true);
      await onRefresh(server.id);
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return "N/A";
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString();
  };

  return (
    <Card
      className={cn(
        "glass transition-all duration-300 cursor-pointer hover:border-primary/50",
        isSelected && "border-primary glow-primary",
        server.status === "online" && "border-l-4 border-l-success",
        server.status === "offline" && "border-l-4 border-l-destructive"
      )}
      onClick={() => onSelect?.(server.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              server.status === "online" ? "bg-success/10" : "bg-muted"
            )}>
              <ServerIcon className={cn(
                "h-5 w-5",
                server.status === "online" ? "text-success" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <CardTitle className="text-lg">{server.name}</CardTitle>
              <p className="text-sm text-muted-foreground font-mono">{server.ip_address}</p>
            </div>
          </div>
          <StatusBadge status={server.status} pulse={server.status === "online"} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">VMs:</span>
            <span className="font-medium">{server.vms_count}</span>
          </div>
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Workers:</span>
            <span className="font-medium">{server.workers_count}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground truncate">
              {formatDate(server.last_seen)}
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="pt-4 border-t border-border space-y-3 animate-fade-in">
            {server.cpu_info && Object.keys(server.cpu_info).length > 0 && (
              <div className="flex items-start gap-2">
                <Cpu className="h-4 w-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <span className="text-muted-foreground">CPU: </span>
                  <span className="font-mono">
                    {server.cpu_info["Model name"] || server.cpu_info["Architecture"] || "Unknown"}
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MemoryStick className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Memory: </span>
              <span className="text-sm font-mono">{formatBytes(server.memory_total)}</span>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Disk: </span>
              <span className="text-sm font-mono">{formatBytes(server.disk_total)}</span>
            </div>
            {server.last_error && (
              <div className="p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
                {server.last_error}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                More
              </>
            )}
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRefresh();
              }}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(server.id);
              }}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

