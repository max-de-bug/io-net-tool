"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { X, Monitor, Loader2, Cpu, MemoryStick, HardDrive } from "lucide-react";
import { api, Server } from "@/lib/api";

interface CreateVMModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  servers: Server[];
}

export function CreateVMModal({ isOpen, onClose, onSuccess, servers }: CreateVMModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    server_id: "",
    name: "",
    vcpus: 2,
    ram_mb: 2048,
    disk_gb: 10,
    vm_username: "vmadm",
    vm_password: "vmadm",
    ip_address: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await api.createVM({
        ...formData,
        ip_address: formData.ip_address || undefined,
      });
      onSuccess();
      onClose();
      setFormData({
        server_id: "",
        name: "",
        vcpus: 2,
        ram_mb: 2048,
        disk_gb: 10,
        vm_username: "vmadm",
        vm_password: "vmadm",
        ip_address: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create VM");
    } finally {
      setIsLoading(false);
    }
  };

  const onlineServers = servers.filter((s) => s.status === "online");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative glass rounded-2xl p-6 w-full max-w-lg mx-4 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Monitor className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-xl font-semibold">Create Virtual Machine</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="server_id">Host Server</Label>
            <select
              id="server_id"
              value={formData.server_id}
              onChange={(e) => setFormData({ ...formData, server_id: e.target.value })}
              required
              className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select a server</option>
              {onlineServers.map((server) => (
                <option key={server.id} value={server.id}>
                  {server.name} ({server.ip_address})
                </option>
              ))}
            </select>
            {onlineServers.length === 0 && (
              <p className="text-xs text-warning">No online servers available</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">VM Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="worker-vm-01"
              required
              className="bg-background/50"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vcpus" className="flex items-center gap-1">
                <Cpu className="h-3 w-3" /> vCPUs
              </Label>
              <Input
                id="vcpus"
                type="number"
                min={1}
                max={32}
                value={formData.vcpus}
                onChange={(e) => setFormData({ ...formData, vcpus: parseInt(e.target.value) })}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ram_mb" className="flex items-center gap-1">
                <MemoryStick className="h-3 w-3" /> RAM (MB)
              </Label>
              <Input
                id="ram_mb"
                type="number"
                min={512}
                max={65536}
                step={512}
                value={formData.ram_mb}
                onChange={(e) => setFormData({ ...formData, ram_mb: parseInt(e.target.value) })}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disk_gb" className="flex items-center gap-1">
                <HardDrive className="h-3 w-3" /> Disk (GB)
              </Label>
              <Input
                id="disk_gb"
                type="number"
                min={5}
                max={500}
                value={formData.disk_gb}
                onChange={(e) => setFormData({ ...formData, disk_gb: parseInt(e.target.value) })}
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ip_address">IP Address (optional)</Label>
            <Input
              id="ip_address"
              value={formData.ip_address}
              onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
              placeholder="192.168.122.101 (auto-generated if empty)"
              className="bg-background/50 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vm_username">VM Username</Label>
              <Input
                id="vm_username"
                value={formData.vm_username}
                onChange={(e) => setFormData({ ...formData, vm_username: e.target.value })}
                placeholder="vmadm"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vm_password">VM Password</Label>
              <Input
                id="vm_password"
                type="password"
                value={formData.vm_password}
                onChange={(e) => setFormData({ ...formData, vm_password: e.target.value })}
                placeholder="vmadm"
                className="bg-background/50"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-accent hover:bg-accent/90"
              disabled={isLoading || onlineServers.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create VM"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

