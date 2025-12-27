const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Server {
  id: string;
  name: string;
  ip_address: string;
  ssh_username: string;
  ssh_port: number;
  status: 'online' | 'offline' | 'connecting' | 'error';
  last_seen: string | null;
  last_error: string | null;
  cpu_info: Record<string, string>;
  memory_total: number | null;
  disk_total: number | null;
  workers_count: number;
  vms_count: number;
  created_at: string;
  updated_at: string;
}

export interface VirtualMachine {
  id: string;
  server: string;
  server_name: string;
  name: string;
  vm_username: string;
  vcpus: number;
  ram_mb: number;
  disk_gb: number;
  ip_address: string | null;
  mac_address: string;
  status: 'running' | 'paused' | 'stopped' | 'creating' | 'error';
  last_seen: string | null;
  last_error: string | null;
  workers_count: number;
  created_at: string;
  updated_at: string;
}

export interface Worker {
  id: string;
  name: string;
  device_id: string;
  user_id: string;
  virtual_machine: string | null;
  server: string | null;
  host_name: string;
  host_type: 'vm' | 'server';
  container_id: string;
  container_name: string;
  image_name: string;
  status: 'running' | 'paused' | 'inactive' | 'failed' | 'terminated' | 'unsupported' | 'blocked' | 'restart_required' | 'installing' | 'unknown';
  last_seen: string | null;
  last_error: string | null;
  cpu_usage: number | null;
  memory_usage: number | null;
  uptime_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_servers: number;
  online_servers: number;
  total_vms: number;
  running_vms: number;
  total_workers: number;
  running_workers: number;
  failed_workers: number;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Dashboard
  getStats: () => fetchApi<DashboardStats>('/dashboard/stats/'),

  // Servers
  getServers: () => fetchApi<Server[]>('/servers/'),
  getServer: (id: string) => fetchApi<Server>(`/servers/${id}/`),
  createServer: (data: { name: string; ip_address: string; ssh_username: string; ssh_password: string; ssh_port?: number }) =>
    fetchApi<{ server: Server; connection: any }>('/servers/', { method: 'POST', body: JSON.stringify(data) }),
  deleteServer: (id: string) => fetchApi<void>(`/servers/${id}/`, { method: 'DELETE' }),
  checkServerStatus: (id: string) => fetchApi<{ server: Server; status_check: any }>(`/servers/${id}/check_status/`, { method: 'POST' }),
  checkServerWorkers: (id: string) => fetchApi<{ server: Server; workers: any[] }>(`/servers/${id}/check_workers/`, { method: 'POST' }),
  setupVirtualization: (id: string) => fetchApi<any>(`/servers/${id}/setup_virtualization/`, { method: 'POST' }),
  downloadBaseImage: (id: string) => fetchApi<any>(`/servers/${id}/download_base_image/`, { method: 'POST' }),

  // Virtual Machines
  getVMs: () => fetchApi<VirtualMachine[]>('/vms/'),
  getVM: (id: string) => fetchApi<VirtualMachine>(`/vms/${id}/`),
  createVM: (data: { server_id: string; name: string; vcpus?: number; ram_mb?: number; disk_gb?: number; vm_username?: string; vm_password?: string; ip_address?: string }) =>
    fetchApi<{ vm: VirtualMachine; result: any }>('/vms/', { method: 'POST', body: JSON.stringify(data) }),
  deleteVM: (id: string) => fetchApi<any>(`/vms/${id}/remove/`, { method: 'DELETE' }),
  startVM: (id: string) => fetchApi<{ vm: VirtualMachine; result: any }>(`/vms/${id}/start/`, { method: 'POST' }),
  stopVM: (id: string) => fetchApi<{ vm: VirtualMachine; result: any }>(`/vms/${id}/stop/`, { method: 'POST' }),
  destroyVM: (id: string) => fetchApi<{ vm: VirtualMachine; result: any }>(`/vms/${id}/destroy/`, { method: 'POST' }),
  installWorkerOnVM: (id: string, device_id: string, user_id: string) =>
    fetchApi<any>(`/vms/${id}/install_worker/`, { method: 'POST', body: JSON.stringify({ device_id, user_id }) }),

  // Workers
  getWorkers: (params?: { status?: string; server?: string; vm?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.server) searchParams.set('server', params.server);
    if (params?.vm) searchParams.set('vm', params.vm);
    const query = searchParams.toString();
    return fetchApi<Worker[]>(`/workers/${query ? `?${query}` : ''}`);
  },
  getWorker: (id: string) => fetchApi<Worker>(`/workers/${id}/`),
  startWorker: (id: string) => fetchApi<{ worker: Worker; result: any }>(`/workers/${id}/start/`, { method: 'POST' }),
  stopWorker: (id: string) => fetchApi<{ worker: Worker; result: any }>(`/workers/${id}/stop/`, { method: 'POST' }),
  restartWorker: (id: string) => fetchApi<{ worker: Worker; result: any }>(`/workers/${id}/restart/`, { method: 'POST' }),
  getWorkerLogs: (id: string, lines?: number) => fetchApi<{ success: boolean; logs: string; errors: string }>(`/workers/${id}/logs/?lines=${lines || 100}`),

  // Bulk actions
  checkAllStatus: () => fetchApi<any[]>('/check-all/', { method: 'POST' }),
  installWorker: (data: { device_id: string; user_id: string; vm_id?: string; server_id?: string }) =>
    fetchApi<any>('/install-worker/', { method: 'POST', body: JSON.stringify(data) }),
};

