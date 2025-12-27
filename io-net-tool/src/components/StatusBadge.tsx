"use client";

import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  pulse?: boolean;
  className?: string;
}

const statusConfig: Record<string, { variant: "default" | "success" | "warning" | "destructive" | "secondary"; label: string; glow?: string }> = {
  // Server statuses
  online: { variant: "success", label: "Online", glow: "glow-success" },
  offline: { variant: "destructive", label: "Offline" },
  connecting: { variant: "warning", label: "Connecting" },
  error: { variant: "destructive", label: "Error" },
  
  // VM statuses
  running: { variant: "success", label: "Running", glow: "glow-success" },
  paused: { variant: "warning", label: "Paused", glow: "glow-warning" },
  stopped: { variant: "secondary", label: "Stopped" },
  creating: { variant: "warning", label: "Creating" },
  
  // Worker statuses
  inactive: { variant: "secondary", label: "Inactive" },
  failed: { variant: "destructive", label: "Failed", glow: "glow-destructive" },
  terminated: { variant: "destructive", label: "Terminated" },
  unsupported: { variant: "destructive", label: "Unsupported" },
  blocked: { variant: "destructive", label: "Blocked" },
  restart_required: { variant: "warning", label: "Restart Required", glow: "glow-warning" },
  installing: { variant: "warning", label: "Installing" },
  unknown: { variant: "secondary", label: "Unknown" },
};

export function StatusBadge({ status, pulse = false, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { variant: "secondary" as const, label: status };
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(
        "gap-1.5",
        pulse && config.glow,
        className
      )}
    >
      <span 
        className={cn(
          "h-2 w-2 rounded-full",
          config.variant === "success" && "bg-green-400",
          config.variant === "warning" && "bg-yellow-400",
          config.variant === "destructive" && "bg-red-400",
          config.variant === "secondary" && "bg-gray-400",
          pulse && "animate-pulse"
        )}
      />
      {config.label}
    </Badge>
  );
}

