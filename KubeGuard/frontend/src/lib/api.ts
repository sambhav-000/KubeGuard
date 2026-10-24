
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
};
