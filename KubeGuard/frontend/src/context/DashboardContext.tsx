"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  ClusterInfo,
  Environment,
  IncidentItem,
  WorkloadItem,
  DeploymentRecord,
  AlertRule,
} from "@/lib/types";
import {
  mockClusters,
  mockWorkloads,
  mockIncidents,
  mockDeployments,
  mockAlertRules,
} from "@/lib/mock-data";

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
  // Interactive mutations
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

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [clusters] = useState<ClusterInfo[]>(mockClusters);
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

  const showToast = (title: string, message?: string, type: ToastItem["type"] = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed(new Date().toLocaleTimeString());
      showToast("Cluster state synchronized", "Fetched live metrics from Kubernetes API server", "success");
    }, 900);
  };

  const openConfirmModal = (config: Omit<ConfirmModalState, "isOpen">) => {
    setConfirmModal({ ...config, isOpen: true });
  };

  const closeConfirmModal = () => {
    setConfirmModal(null);
  };

  const restartWorkload = (workloadId: string) => {
    const wl = workloads.find((w) => w.id === workloadId);
    if (!wl) return;
    openConfirmModal({
      title: `Restart Pods for ${wl.name}?`,
      message: `This will trigger a rollout restart for Deployment ${wl.namespace}/${wl.name}. Kubernetes will spin up replacement pods gracefully.`,
      confirmText: "Restart Pods",
      isDanger: true,
      onConfirm: () => {
        setWorkloads((prev) =>
          prev.map((w) =>
            w.id === workloadId
              ? { ...w, restarts: w.restarts + 1, status: "Healthy", lastUpdated: "Just now" }
              : w
          )
        );
        showToast("Rollout restart initiated", `${wl.name} pods are being recreated gracefully`, "success");
      },
    });
  };

  const scaleWorkload = (workloadId: string, delta: number) => {
    setWorkloads((prev) =>
      prev.map((w) => {
        if (w.id === workloadId) {
          const newDesired = Math.max(1, w.desiredReplicas + delta);
          showToast("Scaling replica target", `${w.name} scaled to ${newDesired} replicas`, "info");
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
    showToast("Incident marked resolved", "Health probes confirmed normal status", "success");
    if (selectedIncident?.id === incidentId) {
      setSelectedIncident((prev) => prev ? { ...prev, severity: "resolved", status: "remediated" } : null);
    }
  };

  const triggerIncidentRemediation = (incidentId: string) => {
    const inc = incidents.find((i) => i.id === incidentId);
    if (!inc) return;

    showToast("KubeGuard Remediation Dispatched", `Executing automated recovery recipe for ${inc.workload}`, "info");
    setTimeout(() => {
      setIncidents((prev) =>
        prev.map((i) =>
          i.id === incidentId
            ? { ...i, severity: "resolved", status: "remediated", actionTaken: "KubeGuard automated recovery recipe executed successfully" }
            : i
        )
      );
      showToast("Recovery Verified", `${inc.workload} restored to Healthy state`, "success");
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident((prev) => prev ? { ...prev, severity: "resolved", status: "remediated" } : null);
      }
    }, 1800);
  };

  const rollbackDeployment = (deploymentId: string) => {
    const dep = deployments.find((d) => d.id === deploymentId);
    if (!dep) return;

    openConfirmModal({
      title: `Rollback Deployment ${dep.name}?`,
      message: `Are you sure you want to rollback ${dep.name} (${dep.version}) to the previous stable release? This will update the ReplicaSet immediately.`,
      confirmText: "Execute Rollback",
      isDanger: true,
      onConfirm: () => {
        setDeployments((prev) =>
          prev.map((d) =>
            d.id === deploymentId
              ? { ...d, version: "v2.0.8 (rolled back)", status: "Healthy", deployedAt: "Just now" }
              : d
          )
        );
        showToast("Rollback executed", `Rolled back ${dep.name} to prior stable revision`, "success");
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
