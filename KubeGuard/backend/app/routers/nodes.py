"""Nodes read-only endpoints."""

import logging
from typing import List
from fastapi import APIRouter, HTTPException
from kubernetes.client.exceptions import ApiException

from app.core.k8s_client import k8s_manager
from app.models.schemas import NodeListResponse, NodeItem, NodeCondition, ErrorResponse

logger = logging.getLogger("kubeguard.nodes")
router = APIRouter(prefix="/nodes", tags=["Nodes"])


@router.get(
    "",
    response_model=NodeListResponse,
    summary="List Kubernetes cluster nodes",
    responses={500: {"model": ErrorResponse}},
)
def get_nodes():
    """Returns actual nodes from the connected Kubernetes cluster."""
    try:
        nodes = k8s_manager.core_v1.list_node().items
        items: List[NodeItem] = []

        for node in nodes:
            name = node.metadata.name
            labels = node.metadata.labels or {}

            # Detect roles from labels
            roles = []
            for label in labels:
                if label.startswith("node-role.kubernetes.io/"):
                    role = label.split("/", 1)[1]
                    if role:
                        roles.append(role)
            if not roles:
                roles = ["worker"]

            # Parse conditions
            conditions: List[NodeCondition] = []
            node_status = "Unknown"
            for cond in node.status.conditions or []:
                conditions.append(
                    NodeCondition(
                        type=cond.type,
                        status=cond.status,
                        reason=cond.reason,
                        message=cond.message,
                    )
                )
                if cond.type == "Ready":
                    node_status = "Ready" if cond.status == "True" else "NotReady"

            node_info = node.status.node_info
            addresses = node.status.addresses or []
            internal_ip = None
            for addr in addresses:
                if addr.type == "InternalIP":
                    internal_ip = addr.address
                    break

            capacity = node.status.capacity or {}
            allocatable = node.status.allocatable or {}

            created_at = (
                node.metadata.creation_timestamp.isoformat()
                if node.metadata.creation_timestamp
                else "unknown"
            )

            items.append(
                NodeItem(
                    name=name,
                    status=node_status,
                    roles=roles,
                    version=node_info.kubelet_version if node_info else "unknown",
                    os_image=node_info.os_image if node_info else "unknown",
                    container_runtime=node_info.container_runtime_version if node_info else "unknown",
                    internal_ip=internal_ip,
                    architecture=node_info.architecture if node_info else "unknown",
                    cpu_capacity=capacity.get("cpu", "0"),
                    memory_capacity=capacity.get("memory", "0"),
                    pods_capacity=capacity.get("pods", "0"),
                    cpu_allocatable=allocatable.get("cpu", "0"),
                    memory_allocatable=allocatable.get("memory", "0"),
                    conditions=conditions,
                    created_at=created_at,
                )
            )

        return NodeListResponse(total=len(items), items=items)

    except ApiException as e:
        logger.error(f"Kubernetes API error fetching nodes: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Kubernetes API error: {e.reason} (HTTP {e.status})",
        )
    except Exception as e:
        logger.error(f"Unexpected error fetching nodes: {e}")
        raise HTTPException(status_code=500, detail=str(e))
