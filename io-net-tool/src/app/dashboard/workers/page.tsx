"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { WorkerCard } from "@/components/WorkerCard";
import { api, Worker } from "@/lib/api";
import { Box, Filter, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedWorkerLogs, setSelectedWorkerLogs] = useState<{
    id: string;
    name: string;
    logs: string;
  } | null>(null);

  const fetchWorkers = async () => {
    try {
      const data = await api.getWorkers();
      setWorkers(data);
    } catch (error) {
      console.error("Failed to fetch workers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await api.checkAllStatus();
    await fetchWorkers();
    setIsRefreshing(false);
  };

  const handleWorkerStart = async (id: string) => {
    await api.startWorker(id);
    await fetchWorkers();
  };

  const handleWorkerStop = async (id: string) => {
    await api.stopWorker(id);
    await fetchWorkers();
  };

  const handleWorkerRestart = async (id: string) => {
    await api.restartWorker(id);
    await fetchWorkers();
  };

  const handleViewLogs = async (id: string) => {
    const worker = workers.find((w) => w.id === id);
    if (!worker) return;

    try {
      const result = await api.getWorkerLogs(id, 200);
      setSelectedWorkerLogs({
        id,
        name: worker.name,
        logs: result.logs || result.errors || "No logs available",
      });
    } catch (error) {
      setSelectedWorkerLogs({
        id,
        name: worker.name,
        logs: "Failed to fetch logs",
      });
    }
  };

  const filteredWorkers = workers.filter((worker) => {
    if (statusFilter === "all") return true;
    return worker.status === statusFilter;
  });

  const statusCounts = {
    all: workers.length,
    running: workers.filter((w) => w.status === "running").length,
    paused: workers.filter((w) => w.status === "paused").length,
    inactive: workers.filter((w) => w.status === "inactive").length,
    failed: workers.filter((w) => w.status === "failed").length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-success/20 animate-pulse flex items-center justify-center">
            <div className="h-6 w-6 rounded-full bg-success animate-ping" />
          </div>
          <p className="text-muted-foreground">Loading workers...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        title="Workers"
        subtitle={`${statusCounts.running} of ${workers.length} workers running`}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="p-6 space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`glass rounded-xl p-4 text-center transition-all hover:border-primary/50 ${
                statusFilter === status ? "border-primary glow-primary" : ""
              }`}
            >
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm text-muted-foreground capitalize">{status}</p>
            </button>
          ))}
        </div>

        {/* Workers Grid */}
        {filteredWorkers.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Box className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {statusFilter === "all" ? "No workers found" : `No ${statusFilter} workers`}
            </h3>
            <p className="text-muted-foreground">
              {statusFilter === "all"
                ? "Workers will appear here once detected on your servers"
                : "Try changing the filter to see other workers"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkers.map((worker, i) => (
              <div
                key={worker.id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <WorkerCard
                  worker={worker}
                  onStart={handleWorkerStart}
                  onStop={handleWorkerStop}
                  onRestart={handleWorkerRestart}
                  onViewLogs={handleViewLogs}
                />
              </div>
            ))}
          </div>
        )}

        {/* Failed Workers Alert */}
        {statusCounts.failed > 0 && statusFilter === "all" && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {statusCounts.failed} Failed Worker{statusCounts.failed > 1 ? "s" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Some workers have failed and may need attention. Click on a worker to view logs and troubleshoot.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatusFilter("failed")}
                className="text-destructive border-destructive/50 hover:bg-destructive/10"
              >
                View Failed Workers
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Logs Modal */}
      {selectedWorkerLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedWorkerLogs(null)}
          />
          <div className="relative glass rounded-2xl p-6 w-full max-w-3xl mx-4 max-h-[80vh] flex flex-col animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Logs: {selectedWorkerLogs.name}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedWorkerLogs(null)}
              >
                Close
              </Button>
            </div>
            <div className="flex-1 overflow-auto bg-background/50 rounded-lg p-4">
              <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                {selectedWorkerLogs.logs}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

