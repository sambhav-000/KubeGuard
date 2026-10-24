"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  ClusterInfo,
  Environment,
  IncidentItem,
  WorkloadItem,
  DeploymentRecord,
  AlertRule,
  HealthStatus,
} from "@/lib/types";
import {
  mockClusters,
  mockWorkloads,
  mockIncidents,
  mockDeployments,
  mockAlertRules,
} from "@/lib/mock-data";
import {
  kubeguardApi,
  ClusterHealth,
  KubernetesDeployment,
  KubernetesPod,
} from "@/lib/api";

export interface ToastItem {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
}

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
}

interface DashboardContextType {
  clusters: ClusterInfo[];
  currentCluster: ClusterInfo;
  setCurrentClusterId: (id: string) => void;
  currentEnv: Environment;
  setCurrentEnv: (env: Environment) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  timeRange: "1h" | "6h" | "24h" | "7d";
  setTimeRange: (range: "1h" | "6h" | "24h" | "7d") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isRefreshing: boolean;
  lastRefreshed: string;
  triggerRefresh: () => void;
  toasts: ToastItem[];
  showToast: (title: string, message?: string, type?: ToastItem["type"]) => void;
  removeToast: (id: string) => void;
  selectedIncident: IncidentItem | null;
  setSelectedIncident: (incident: IncidentItem | null) => void;
  confirmModal: ConfirmModalState | null;
  openConfirmModal: (config: Omit<ConfirmModalState, "isOpen">) => void;
  closeConfirmModal: () => void;
  // Interactive operations
  workloads: WorkloadItem[];
  restartWorkload: (workloadId: string) => void;
  scaleWorkload: (workloadId: string, delta: number) => void;
  incidents: IncidentItem[];
  resolveIncident: (incidentId: string) => void;
  triggerIncidentRemediation: (incidentId: string) => void;
  deployments: DeploymentRecord[];
  rollbackDeployment: (deploymentId: string) => void;
  alertRules: AlertRule[];
  toggleAlertRule: (ruleId: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

function deriveWorkloadStatus(desired: number, ready: number): HealthStatus {
  if (desired > 0 && ready === 0) {
    return "Failed";
  }
  if (ready >= desired) {
    return "Healthy";
  }
  return "Degraded";
}

function deriveDeploymentStatus(
  desired: number,
  available: number
): "Healthy" | "Rolling Out" | "Failed" | "Rolled Back" {
  if (desired > 0 && available === 0) {
    return "Failed";
  }
  if (available >= desired) {
    return "Healthy";
  }
  return "Rolling Out";
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [clusters, setClusters] = useState<ClusterInfo[]>(mockClusters);
  const [currentClusterId, setCurrentClusterId] = useState<string>("kube-prod-cluster");
  const [currentEnv, setCurrentEnv] = useState<Environment>("PRODUCTION");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h" | "7d">("6h");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("14:32:00");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);

  // Dynamic state for interactive operations
  const [workloads, setWorkloads] = useState<WorkloadItem[]>(mockWorkloads);
  const [incidents, setIncidents] = useState<IncidentItem[]>(mockIncidents);
  const [deployments, setDeployments] = useState<DeploymentRecord[]>(mockDeployments);
  const [alertRules, setAlertRules] = useState<AlertRule[]>(mockAlertRules);

  const currentCluster = clusters.find((c) => c.id === currentClusterId) || clusters[0];
  const isRefreshingRef = useRef(false);

  const showToast = useCallback(
    (title: string, message?: string, type: ToastItem["type"] = "info") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  // Maps live Kubernetes data to application models
  const applyLiveData = useCallback(
    (
      health: ClusterHealth,
      deploymentList: KubernetesDeployment[],
      podList: KubernetesPod[]
    ) => {
      // 1. Map workloads conservatively without fabricating unavailable metrics
      const mappedWorkloads: WorkloadItem[] = deploymentList.map((dep) => {
        const matchingPods = podList.filter(
          (p) =>
            p.namespace === dep.namespace &&
            (p.name === dep.name || p.name.startsWith(dep.name + "-"))
        );
        const totalRestarts = matchingPods.reduce(
          (acc, p) => acc + (typeof p.restarts === "number" ? p.restarts : 0),
          0
        );

        return {
          id: `${dep.namespace}-${dep.name}`,
          name: dep.name,
          namespace: dep.namespace,
          kind: "Deployment",
          desiredReplicas: dep.desired_replicas,
          readyReplicas: dep.ready_replicas,
          cpuUsage: " — ",
          cpuPercent: 0,
          memUsage: " — ",
          memPercent: 0,
          status: deriveWorkloadStatus(dep.desired_replicas, dep.ready_replicas),
          restarts: totalRestarts,
          lastUpdated: " — ",
          image: " — ",
        };
      });

      // 2. Map deployments conservatively
      const mappedDeployments: DeploymentRecord[] = deploymentList.map((dep) => ({
        id: `dep-${dep.namespace}-${dep.name}`,
        name: dep.name,
        namespace: dep.namespace,
        version: " — ",
        imageTag: " — ",
        commitHash: " — ",
        author: " — ",
        deployedAt: " — ",
        status: deriveDeploymentStatus(dep.desired_replicas, dep.available_replicas),
        desiredReplicas: dep.desired_replicas,
        availableReplicas: dep.available_replicas,
      }));

      setWorkloads(mappedWorkloads);
      setDeployments(mappedDeployments);

      // 3. Update cluster metrics
      const running = podList.filter((p) => p.phase === "Running").length;
      const pending = podList.filter((p) => p.phase === "Pending").length;
      const failed = podList.filter((p) => p.phase === "Failed").length;

      setClusters((prev) =>
        prev.map((c) => ({
          ...c,
          name: health.cluster_context || c.name,
          status: health.status === "connected" ? "healthy" : "degraded",
          healthPercentage:
            health.node_count > 0
              ? Math.round((health.ready_nodes / health.node_count) * 100)
              : 100,
          nodeCount: { ready: health.ready_nodes, total: health.node_count },
          podCount: { running, pending, failed, total: podList.length },
          lastSync: "Just now",
        }))
      );

      setLastRefreshed(new Date().toLocaleTimeString());
    },
    []
  );

  // Asynchronous API refresh handler with Promise.all
  const fetchLiveData = useCallback(
    async (isManualRefresh: boolean) => {
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;
      setIsRefreshing(true);

      try {
        const [health, deploymentList, podList] = await Promise.all([
          kubeguardApi.health(),
          kubeguardApi.deployments(),
          kubeguardApi.pods(),
        ]);

        applyLiveData(health, deploymentList, podList);

        if (isManualRefresh) {
          showToast(
            "Cluster state synchronized",
            `Fetched ${deploymentList.length} deployments and ${podList.length} pods from Kubernetes API`,
            "success"
          );
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to communicate with Kubernetes API";
        showToast("Cluster synchronization failed", message, "error");
      } finally {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
      }
    },
    [applyLiveData, showToast]
  );

  // Automatic live fetch on mount
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      isRefreshingRef.current = true;
      setIsRefreshing(true);

      try {
        const [health, deploymentList, podList] = await Promise.all([
          kubeguardApi.health(),
          kubeguardApi.deployments(),
          kubeguardApi.pods(),
        ]);

        if (!isMounted) return;
        applyLiveData(health, deploymentList, podList);
      } catch (err: unknown) {
        if (!isMounted) return;
        const message =
          err instanceof Error
            ? err.message
            : "Failed to communicate with Kubernetes API";
        showToast("Cluster synchronization failed", message, "error");
      } finally {
        if (isMounted) {
          isRefreshingRef.current = false;
          setIsRefreshing(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [applyLiveData, showToast]);

  // Real asynchronous manual refresh
  const triggerRefresh = useCallback(() => {
    fetchLiveData(true);
  }, [fetchLiveData]);

  const openConfirmModal = (config: Omit<ConfirmModalState, "isOpen">) => {
    setConfirmModal({ ...config, isOpen: true });
  };

  const closeConfirmModal = () => {
    setConfirmModal(null);
  };

  // Simulated handlers preserved without claiming real Kubernetes operations
  const restartWorkload = (workloadId: string) => {
    const wl = workloads.find((w) => w.id === workloadId);
    if (!wl) return;
    openConfirmModal({
      title: `Simulate Restart for ${wl.name}?`,
      message: `This will simulate a rollout restart for ${wl.namespace}/${wl.name} in the local dashboard state.`,
      confirmText: "Simulate Restart",
      isDanger: true,
      onConfirm: () => {
        setWorkloads((prev) =>
          prev.map((w) =>
            w.id === workloadId
              ? { ...w, restarts: w.restarts + 1, status: "Healthy", lastUpdated: "Just now" }
              : w
          )
        );
        showToast("Simulated restart triggered", `Restart simulated for ${wl.name} in dashboard view`, "info");
      },
    });
  };

  const scaleWorkload = (workloadId: string, delta: number) => {
    setWorkloads((prev) =>
      prev.map((w) => {
        if (w.id === workloadId) {
          const newDesired = Math.max(1, w.desiredReplicas + delta);
          showToast(
            "Simulated scaling updated",
            `${w.name} target updated to ${newDesired} replicas (frontend simulation)`,
            "info"
          );
          return {
            ...w,
            desiredReplicas: newDesired,
            readyReplicas: newDesired,
            status: "Healthy",
          };
        }
        return w;
      })
    );
  };

  const resolveIncident = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? { ...inc, severity: "resolved", status: "remediated" }
          : inc
      )
    );
    showToast("Incident marked resolved", "Health state updated in dashboard view", "success");
    if (selectedIncident?.id === incidentId) {
      setSelectedIncident((prev) => prev ? { ...prev, severity: "resolved", status: "remediated" } : null);
    }
  };

  const triggerIncidentRemediation = (incidentId: string) => {
    const inc = incidents.find((i) => i.id === incidentId);
    if (!inc) return;

    showToast("Remediation simulation dispatched", `Simulating recovery workflow for ${inc.workload}`, "info");
    setTimeout(() => {
      setIncidents((prev) =>
        prev.map((i) =>
          i.id === incidentId
            ? { ...i, severity: "resolved", status: "remediated", actionTaken: "Automated recovery simulation verified" }
            : i
        )
      );
      showToast("Recovery Verified", `${inc.workload} restored to Healthy state (simulated)`, "success");
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident((prev) => prev ? { ...prev, severity: "resolved", status: "remediated" } : null);
      }
    }, 1800);
  };

  const rollbackDeployment = (deploymentId: string) => {
    const dep = deployments.find((d) => d.id === deploymentId);
    if (!dep) return;

    openConfirmModal({
      title: `Simulate Rollback for ${dep.name}?`,
      message: `Are you sure you want to simulate rolling back ${dep.name} in the dashboard view?`,
      confirmText: "Simulate Rollback",
      isDanger: true,
      onConfirm: () => {
        setDeployments((prev) =>
          prev.map((d) =>
            d.id === deploymentId
              ? { ...d, version: "v2.0.8 (simulated rollback)", status: "Healthy", deployedAt: "Just now" }
              : d
          )
        );
        showToast("Simulated rollback applied", `Rollback simulation applied to ${dep.name}`, "info");
      },
    });
  };

  const toggleAlertRule = (ruleId: string) => {
    setAlertRules((prev) =>
      prev.map((r) => {
        if (r.id === ruleId) {
          const nextState = !r.enabled;
          showToast(
            nextState ? "Alert rule enabled" : "Alert rule muted",
            `${r.name} is now ${nextState ? "active" : "disabled"}`,
            nextState ? "success" : "warning"
          );
          return { ...r, enabled: nextState };
        }
        return r;
      })
    );
  };

  return (
    <DashboardContext.Provider
      value={{
        clusters,
        currentCluster,
        setCurrentClusterId,
        currentEnv,
        setCurrentEnv,
        sidebarCollapsed,
        toggleSidebar,
        mobileMenuOpen,
        setMobileMenuOpen,
        timeRange,
        setTimeRange,
        searchQuery,
        setSearchQuery,
        isRefreshing,
        lastRefreshed,
        triggerRefresh,
        toasts,
        showToast,
        removeToast,
        selectedIncident,
        setSelectedIncident,
        confirmModal,
        openConfirmModal,
        closeConfirmModal,
        workloads,
        restartWorkload,
        scaleWorkload,
        incidents,
        resolveIncident,
        triggerIncidentRemediation,
        deployments,
        rollbackDeployment,
        alertRules,
        toggleAlertRule,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
