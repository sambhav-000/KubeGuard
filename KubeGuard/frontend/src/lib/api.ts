const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:9000";

export type ClusterHealth = {
  status: string;
  cluster_context?: string;
  node_count: number;
  ready_nodes: number;
};

export type KubernetesNode = {
  name: string;
  status: string;
  kubelet_version: string;
  os: string;
  architecture: string;
};

export type KubernetesPod = {
  name: string;
  namespace: string;
  phase: string;
  restarts: number;
  ready: boolean;
  node: string | null;
};

export type KubernetesDeployment = {
  name: string;
  namespace: string;
  desired_replicas: number;
  ready_replicas: number;
  available_replicas: number;
};

export type MetricsSummary = {
  status: string;
  cpu_usage_percent: number | null;
  cpu_usage_cores: number | null;
  cpu_total_cores: number | null;
  memory_usage_percent: number | null;
  memory_usage_bytes: number | null;
  memory_total_bytes: number | null;
  network_in_mbps: number | null;
  network_out_mbps: number | null;
  timestamp: number | null;
  message?: string | null;
};

export type MetricTimePoint = {
  timestamp: number;
  time: string;
  cpu: number;
  cpu_cores: number;
  memory: number;
  memory_bytes: number;
  network_in: number;
  network_out: number;
};

export type MetricsRangeResponse = {
  status: string;
  range: string;
  points: MetricTimePoint[];
  total_cores?: number | null;
  total_memory_bytes?: number | null;
  message?: string | null;
};

export type DeploymentMetric = {
  name: string;
  namespace: string;
  cpu_cores: number;
  cpu_display: string;
  cpu_percent: number;
  memory_bytes: number;
  memory_display: string;
  memory_percent: number;
  pod_count: number;
};

export type PodMetric = {
  name: string;
  namespace: string;
  cpu_cores: number;
  cpu_display: string;
  memory_bytes: number;
  memory_display: string;
};

export type WorkloadMetricsResponse = {
  status: string;
  deployments: DeploymentMetric[];
  pods: PodMetric[];
  message?: string | null;
};

async function getJSON<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`KubeGuard API returned HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

export const kubeguardApi = {
  health: () => getJSON<ClusterHealth>("/api/health"),
  nodes: () => getJSON<KubernetesNode[]>("/api/nodes"),

  pods: (namespace?: string) =>
    getJSON<KubernetesPod[]>(
      namespace
        ? `/api/pods?namespace=${encodeURIComponent(namespace)}`
        : "/api/pods"
    ),

  deployments: (namespace?: string) =>
    getJSON<KubernetesDeployment[]>(
      namespace
        ? `/api/deployments?namespace=${encodeURIComponent(namespace)}`
        : "/api/deployments"
    ),

  metricsSummary: () => getJSON<MetricsSummary>("/api/metrics/summary"),

  metricsRange: (range: "1h" | "6h" | "24h" | "7d" = "6h") =>
    getJSON<MetricsRangeResponse>(
      `/api/metrics/range?range=${encodeURIComponent(range)}`
    ),

  workloadMetrics: (namespace?: string) =>
    getJSON<WorkloadMetricsResponse>(
      namespace
        ? `/api/metrics/workloads?namespace=${encodeURIComponent(namespace)}`
        : "/api/metrics/workloads"
    ),
};
