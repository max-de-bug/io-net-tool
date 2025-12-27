"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { ServerCard } from "@/components/ServerCard";
import { WorkerCard } from "@/components/WorkerCard";
import { AddServerModal } from "@/components/AddServerModal";
import { useDashboard } from "@/hooks/useDashboard";
import { api } from "@/lib/api";
import {
  Server,
  Monitor,
  Box,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const { stats, servers, workers, isLoading, isConnected, refreshData } = useDashboard();
  const [showAddServer, setShowAddServer] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const handleServerRefresh = async (id: string) => {
    await api.checkServerStatus(id);
    await refreshData();
  };

  const handleServerDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this server?")) {
      await api.deleteServer(id);
      await refreshData();
    }
  };

  const handleWorkerStart = async (id: string) => {
    await api.startWorker(id);
    await refreshData();
  };

  const handleWorkerStop = async (id: string) => {
    await api.stopWorker(id);
    await refreshData();
  };

  const handleWorkerRestart = async (id: string) => {
    await api.restartWorker(id);
    await refreshData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/20 animate-pulse flex items-center justify-center">
            <div className="h-6 w-6 rounded-full bg-primary animate-ping" />
          </div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const runningPercentage = stats
    ? ((stats.running_workers / Math.max(stats.total_workers, 1)) * 100).toFixed(0)
    : 0;

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Monitor your io.net infrastructure"
        isConnected={isConnected}
        onRefresh={handleRefresh}
        onAdd={() => setShowAddServer(true)}
        addLabel="Add Server"
        isRefreshing={isRefreshing}
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Servers"
            value={stats?.total_servers || 0}
            subtitle={`${stats?.online_servers || 0} online`}
            icon={Server}
            trend="up"
            trendValue={`${stats?.online_servers || 0}/${stats?.total_servers || 0} active`}
          />
          <StatsCard
            title="Virtual Machines"
            value={stats?.total_vms || 0}
            subtitle={`${stats?.running_vms || 0} running`}
            icon={Monitor}
            iconClassName="bg-accent/10"
          />
          <StatsCard
            title="Workers"
            value={stats?.total_workers || 0}
            subtitle={`${runningPercentage}% running`}
            icon={Box}
            trend={stats?.running_workers === stats?.total_workers ? "up" : "neutral"}
            trendValue={`${stats?.running_workers || 0} active`}
            iconClassName="bg-success/10"
          />
          <StatsCard
            title="Failed Workers"
            value={stats?.failed_workers || 0}
            icon={AlertTriangle}
            trend={stats?.failed_workers === 0 ? "up" : "down"}
            trendValue={stats?.failed_workers === 0 ? "All healthy" : "Needs attention"}
            iconClassName="bg-destructive/10"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Servers Section */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Servers
              </h2>
              <span className="text-sm text-muted-foreground">
                {servers.length} total
              </span>
            </div>
            
            {servers.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No servers yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your first server to start managing workers
                </p>
                <button
                  onClick={() => setShowAddServer(true)}
                  className="text-primary hover:underline text-sm"
                >
                  + Add Server
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {servers.slice(0, 5).map((server, i) => (
                  <div
                    key={server.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <ServerCard
                      server={server}
                      onRefresh={handleServerRefresh}
                      onDelete={handleServerDelete}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Workers Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Box className="h-5 w-5 text-success" />
                Recent Workers
              </h2>
              <span className="text-sm text-muted-foreground">
                {workers.filter((w) => w.status === "running").length} running
              </span>
            </div>

            {workers.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <Box className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No workers found</h3>
                <p className="text-sm text-muted-foreground">
                  Workers will appear here once detected on your servers
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {workers.slice(0, 6).map((worker, i) => (
                  <div
                    key={worker.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <WorkerCard
                      worker={worker}
                      onStart={handleWorkerStart}
                      onStop={handleWorkerStop}
                      onRestart={handleWorkerRestart}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-muted-foreground">System Status:</span>
                <span className="text-success font-medium">Operational</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Last Sync:</span>
                <span className="font-medium">Just now</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Real-time monitoring enabled
            </div>
          </div>
        </div>
      </div>

      <AddServerModal
        isOpen={showAddServer}
        onClose={() => setShowAddServer(false)}
        onSuccess={refreshData}
      />
    </>
  );
}

