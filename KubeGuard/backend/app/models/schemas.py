"""Pydantic schemas for structured type-safe JSON API responses."""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


# ==================== Common / Error Models ====================

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    code: int = 500


class BaseStatusResponse(BaseModel):
    status: str
    message: str


# ==================== Cluster Info Models ====================

class ClusterVersionInfo(BaseModel):
    major: str
    minor: str
    git_version: str
    platform: str


class ClusterOverviewResponse(BaseModel):
    connected: bool
    context: Optional[str] = None
    target_context: str
    is_target_context: bool
    server: Optional[str] = None
    version: Optional[ClusterVersionInfo] = None
    total_nodes: int = 0
    total_namespaces: int = 0
    total_pods: int = 0
    running_pods: int = 0
    pending_pods: int = 0
    failed_pods: int = 0
    total_deployments: int = 0
    healthy_deployments: int = 0


# ==================== Node Models ====================

class NodeCondition(BaseModel):
    type: str
    status: str
    reason: Optional[str] = None
    message: Optional[str] = None


class NodeItem(BaseModel):
    name: str
    status: str  # Ready, NotReady, Unknown
    roles: List[str]
    version: str
    os_image: str
    container_runtime: str
    internal_ip: Optional[str] = None
    architecture: str
    cpu_capacity: str
    memory_capacity: str
    pods_capacity: str
    cpu_allocatable: str
    memory_allocatable: str
    conditions: List[NodeCondition]
    created_at: str


class NodeListResponse(BaseModel):
    total: int
    items: List[NodeItem]


# ==================== Namespace Models ====================

class NamespaceItem(BaseModel):
    name: str
    status: str  # Active, Terminating
    labels: Dict[str, str] = Field(default_factory=dict)
    created_at: str


class NamespaceListResponse(BaseModel):
    total: int
    items: List[NamespaceItem]


# ==================== Pod Models ====================

class ContainerStateInfo(BaseModel):
    state: str  # running, waiting, terminated
    reason: Optional[str] = None
    message: Optional[str] = None


class ContainerDetail(BaseModel):
    name: str
    image: str
    ready: bool
    restart_count: int
    state: ContainerStateInfo


class PodItem(BaseModel):
    name: str
    namespace: str
    phase: str  # Running, Pending, Succeeded, Failed, Unknown
    ready: bool
    restarts: int
    pod_ip: Optional[str] = None
    node_name: Optional[str] = None
    containers: List[ContainerDetail]
    labels: Dict[str, str] = Field(default_factory=dict)
    created_at: str


class PodListResponse(BaseModel):
    total: int
    items: List[PodItem]


# ==================== Deployment Models ====================

class DeploymentItem(BaseModel):
    name: str
    namespace: str
    desired_replicas: int
    ready_replicas: int
    available_replicas: int
    updated_replicas: int
    status: str  # Healthy, Degraded, Progressing
    images: List[str]
    match_labels: Dict[str, str] = Field(default_factory=dict)
    created_at: str


class DeploymentListResponse(BaseModel):
    total: int
    items: List[DeploymentItem]


# ==================== Event Models ====================

class EventItem(BaseModel):
    type: str  # Normal, Warning
    reason: str
    message: str
    object: str
    namespace: Optional[str] = None
    count: int = 1
    last_timestamp: str


class EventListResponse(BaseModel):
    total: int
    items: List[EventItem]
