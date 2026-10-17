export type HealthStatus = "Healthy" | "Degraded" | "Pending" | "Failed";
export type IncidentSeverity = "critical" | "warning" | "info" | "resolved";
export type IncidentStatus = "investigating" | "in_progress" | "remediation_triggered" | "remediated" | "failed";
export type Environment = "DEVELOPMENT" | "STAGING" | "PRODUCTION";
export type RecoveryActor = "Kubernetes Controller" | "KubeGuard Engine" | "Manual Admin";
export type WorkloadKind = "Deployment" | "StatefulSet" | "DaemonSet";

export interface ClusterInfo {
  id: string;
  name: string;
  environment: Environment;
  k8sVersion: string;
  uptime: string;
  uptimePercent: number;
  lastSync: string;
  status: "healthy" | "degraded" | "critical";
  healthPercentage: number;
  nodeCount: { ready: number; total: number };
  podCount: { running: number; pending: number; failed: number; total: number };
  region: string;
  provider: "kind" | "EKS" | "GKE" | "AKS";
}

export interface NodeInfo {
  name: string;
  role: "control-plane" | "worker";
  status: "Ready" | "NotReady";
  cpuUsage: number; // percentage
  cpuCores: string;
  memUsage: number; // percentage
  memGiB: string;
  podCount: number;
  podCapacity: number;
  kubeletVersion: string;
  osImage: string;
  taints: string[];
}

export interface WorkloadItem {
  id: string;
  name: string;
  namespace: string;
  kind: WorkloadKind;
  desiredReplicas: number;
  readyReplicas: number;
  cpuUsage: string;
  cpuPercent: number;
  memUsage: string;
  memPercent: number;
  status: HealthStatus;
  restarts: number;
  lastUpdated: string;
  image: string;
}

export interface IncidentItem {
  id: string;
  severity: IncidentSeverity;
  title: string;
  workload: string;
  namespace: string;
  failureReason: string;
  detectedAt: string;
  status: IncidentStatus;
  actionTaken: string;
  diagnosis: string;
  logsSnippet?: string[];
  recommendedAction?: string;
  rootCause?: string;
}

export interface RecoveryTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  targetWorkload: string;
  namespace: string;
  actor: RecoveryActor;
  actionType: "Pod Restart" | "Rollback" | "HPA Scaling" | "Node Drain" | "Resource Patch" | "Probe Check";
  status: "Success" | "In Progress" | "Failed";
  details: string;
  durationMs: number;
}

export interface DeploymentRecord {
  id: string;
  name: string;
  namespace: string;
  version: string;
  imageTag: string;
  commitHash: string;
  author: string;
  deployedAt: string;
  status: "Healthy" | "Rolling Out" | "Failed" | "Rolled Back";
  desiredReplicas: number;
  availableReplicas: number;
}

export interface AlertRule {
  id: string;
  name: string;
  target: string;
  metric: "CPU Utilization" | "Memory Utilization" | "Pod Restarts" | "Error Rate" | "Pod Failed";
  condition: ">" | "<" | "=";
  threshold: string;
  duration: string;
  severity: IncidentSeverity;
  enabled: boolean;
  channels: ("Slack" | "PagerDuty" | "Email" | "Webhook")[];
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  actorType: "User" | "KubeGuard Engine" | "K8s Controller";
  action: string;
  resource: string;
  namespace: string;
  outcome: "Success" | "Failure" | "Denied";
  details: string;
}

export interface MetricDataPoint {
  timestamp: string;
  timeLabel: string;
  cpu: number;
  memory: number;
  networkIn: number;
  networkOut: number;
  diskUsage: number;
  requestRate: number;
  errorRate: number;
  latencyP95: number;
}

