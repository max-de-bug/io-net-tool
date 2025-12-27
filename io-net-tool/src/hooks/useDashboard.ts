"use client";

import { useState, useEffect, useCallback } from 'react';
import { api, Server, VirtualMachine, Worker, DashboardStats } from '@/lib/api';
import { useWebSocket } from './useWebSocket';

interface DashboardData {
  stats: DashboardStats | null;
  servers: Server[];
  vms: VirtualMachine[];
  workers: Worker[];
  isLoading: boolean;
  error: string | null;
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData>({
    stats: null,
    servers: [],
    vms: [],
    workers: [],
    isLoading: true,
    error: null,
  });

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/status/';

  const { isConnected, sendMessage } = useWebSocket(wsUrl, {
    onMessage: (message) => {
      if (message.type === 'initial_data') {
        setData((prev) => ({
          ...prev,
          stats: message.data.stats,
          servers: message.data.servers,
          workers: message.data.workers,
          isLoading: false,
        }));
      } else if (message.type === 'status_update') {
        // Handle real-time updates
        if (message.data.type === 'server') {
          setData((prev) => ({
            ...prev,
            servers: prev.servers.map((s) =>
              s.id === message.data.server.id ? message.data.server : s
            ),
          }));
        } else if (message.data.workers) {
          // Update worker statuses
          refreshData();
        }
      }
    },
    reconnectInterval: 5000,
  });

  const refreshData = useCallback(async () => {
    try {
      const [stats, servers, vms, workers] = await Promise.all([
        api.getStats(),
        api.getServers(),
        api.getVMs(),
        api.getWorkers(),
      ]);

      setData({
        stats,
        servers,
        vms,
        workers,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data',
      }));
    }
  }, []);

  const requestRefresh = useCallback(() => {
    if (isConnected) {
      sendMessage({ action: 'refresh' });
    } else {
      refreshData();
    }
  }, [isConnected, sendMessage, refreshData]);

  useEffect(() => {
    // Initial fetch as fallback
    if (!isConnected) {
      refreshData();
    }
  }, [isConnected, refreshData]);

  return {
    ...data,
    isConnected,
    refreshData: requestRefresh,
  };
}

