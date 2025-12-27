"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ServerCard } from "@/components/ServerCard";
import { AddServerModal } from "@/components/AddServerModal";
import { api, Server } from "@/lib/api";
import { Server as ServerIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ServersPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddServer, setShowAddServer] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchServers = async () => {
    try {
      const data = await api.getServers();
      setServers(data);
    } catch (error) {
      console.error("Failed to fetch servers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchServers();
    setIsRefreshing(false);
  };

  const handleServerRefresh = async (id: string) => {
    await api.checkServerStatus(id);
    await fetchServers();
  };

  const handleServerDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this server?")) {
      await api.deleteServer(id);
      await fetchServers();
    }
  };

  const handleSetupVirtualization = async (id: string) => {
    const result = await api.setupVirtualization(id);
    alert(result.message || result.error);
  };

  const handleDownloadBaseImage = async (id: string) => {
    const result = await api.downloadBaseImage(id);
    alert(result.message || result.error);
  };

  const filteredServers = servers.filter((server) => {
    if (statusFilter === "all") return true;
    return server.status === statusFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/20 animate-pulse flex items-center justify-center">
            <div className="h-6 w-6 rounded-full bg-primary animate-ping" />
          </div>
          <p className="text-muted-foreground">Loading servers...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        title="Servers"
        subtitle={`${servers.length} servers connected`}
        onRefresh={handleRefresh}
        onAdd={() => setShowAddServer(true)}
        addLabel="Add Server"
        isRefreshing={isRefreshing}
      />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Status:</span>
          </div>
          <div className="flex gap-2">
            {["all", "online", "offline", "error"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={statusFilter === status ? "bg-primary" : ""}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Servers Grid */}
        {filteredServers.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <ServerIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {statusFilter === "all" ? "No servers yet" : `No ${statusFilter} servers`}
            </h3>
            <p className="text-muted-foreground mb-6">
              {statusFilter === "all"
                ? "Add your first server to start managing your io.net infrastructure"
                : "Try changing the filter to see other servers"}
            </p>
            {statusFilter === "all" && (
              <Button onClick={() => setShowAddServer(true)} className="bg-primary">
                Add Your First Server
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServers.map((server, i) => (
              <div
                key={server.id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <ServerCard
                  server={server}
                  onRefresh={handleServerRefresh}
                  onDelete={handleServerDelete}
                  isSelected={selectedServer === server.id}
                  onSelect={setSelectedServer}
                />
              </div>
            ))}
          </div>
        )}

        {/* Selected Server Actions */}
        {selectedServer && (
          <div className="glass rounded-xl p-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Server Actions</h3>
                <p className="text-sm text-muted-foreground">
                  Selected: {servers.find((s) => s.id === selectedServer)?.name}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSetupVirtualization(selectedServer)}
                >
                  Setup Virtualization
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadBaseImage(selectedServer)}
                >
                  Download Base Image
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleServerRefresh(selectedServer)}
                >
                  Check Workers
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AddServerModal
        isOpen={showAddServer}
        onClose={() => setShowAddServer(false)}
        onSuccess={fetchServers}
      />
    </>
  );
}

