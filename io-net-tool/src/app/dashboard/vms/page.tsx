"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { CreateVMModal } from "@/components/CreateVMModal";
import { StatusBadge } from "@/components/StatusBadge";
import { api, VirtualMachine, Server } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Monitor,
  Play,
  Square,
  Trash2,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Box,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function VMsPage() {
  const [vms, setVMs] = useState<VirtualMachine[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateVM, setShowCreateVM] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [vmsData, serversData] = await Promise.all([
        api.getVMs(),
        api.getServers(),
      ]);
      setVMs(vmsData);
      setServers(serversData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  const handleStartVM = async (id: string) => {
    await api.startVM(id);
    await fetchData();
  };

  const handleStopVM = async (id: string) => {
    await api.stopVM(id);
    await fetchData();
  };

  const handleDeleteVM = async (id: string) => {
    if (confirm("Are you sure you want to delete this VM? This cannot be undone.")) {
      await api.deleteVM(id);
      await fetchData();
    }
  };

  const handleInstallWorker = async (id: string) => {
    const deviceId = prompt("Enter Device ID:");
    if (!deviceId) return;
    const userId = prompt("Enter User ID:");
    if (!userId) return;

    const result = await api.installWorkerOnVM(id, deviceId, userId);
    alert(result.message || result.error);
    await fetchData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-accent/20 animate-pulse flex items-center justify-center">
            <div className="h-6 w-6 rounded-full bg-accent animate-ping" />
          </div>
          <p className="text-muted-foreground">Loading virtual machines...</p>
        </div>
      </div>
    );
  }

  const runningVMs = vms.filter((vm) => vm.status === "running").length;

  return (
    <>
      <Header
        title="Virtual Machines"
        subtitle={`${runningVMs} of ${vms.length} VMs running`}
        onRefresh={handleRefresh}
        onAdd={() => setShowCreateVM(true)}
        addLabel="Create VM"
        isRefreshing={isRefreshing}
      />

      <div className="p-6 space-y-6">
        {vms.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Monitor className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Virtual Machines</h3>
            <p className="text-muted-foreground mb-6">
              Create virtual machines to run isolated io.net workers
            </p>
            <Button onClick={() => setShowCreateVM(true)} className="bg-accent hover:bg-accent/90">
              Create Your First VM
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {vms.map((vm, i) => (
              <Card
                key={vm.id}
                className={cn(
                  "glass animate-fade-in transition-all hover:border-accent/50",
                  vm.status === "running" && "border-l-4 border-l-success",
                  vm.status === "stopped" && "border-l-4 border-l-muted",
                  vm.status === "paused" && "border-l-4 border-l-warning"
                )}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        vm.status === "running" ? "bg-success/10" : "bg-muted"
                      )}>
                        <Monitor className={cn(
                          "h-5 w-5",
                          vm.status === "running" ? "text-success" : "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{vm.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          on {vm.server_name}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={vm.status} pulse={vm.status === "running"} />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* VM Specs */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      <span>{vm.vcpus} vCPU</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MemoryStick className="h-4 w-4 text-muted-foreground" />
                      <span>{vm.ram_mb} MB</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <span>{vm.disk_gb} GB</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Box className="h-4 w-4 text-muted-foreground" />
                      <span>{vm.workers_count} workers</span>
                    </div>
                  </div>

                  {/* Network Info */}
                  {vm.ip_address && (
                    <div className="flex items-center gap-2 text-sm">
                      <Network className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">IP:</span>
                      <span className="font-mono">{vm.ip_address}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    {vm.status !== "running" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartVM(vm.id)}
                        className="flex-1 text-success hover:text-success hover:bg-success/10"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    )}
                    {vm.status === "running" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStopVM(vm.id)}
                          className="flex-1 text-warning hover:text-warning hover:bg-warning/10"
                        >
                          <Square className="h-4 w-4 mr-1" />
                          Stop
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInstallWorker(vm.id)}
                          className="flex-1"
                        >
                          <Box className="h-4 w-4 mr-1" />
                          Install Worker
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteVM(vm.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateVMModal
        isOpen={showCreateVM}
        onClose={() => setShowCreateVM(false)}
        onSuccess={fetchData}
        servers={servers}
      />
    </>
  );
}

