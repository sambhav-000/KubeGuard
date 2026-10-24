"""Pods read-only endpoints."""

import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from kubernetes.client.exceptions import ApiException

from app.core.k8s_client import k8s_manager
from app.models.schemas import (
    PodListResponse,
    PodItem,
    ContainerDetail,
    ContainerStateInfo,
    ErrorResponse,
)

logger = logging.getLogger("kubeguard.pods")
router = APIRouter(prefix="/pods", tags=["Pods"])


@router.get(
    "",
    response_model=PodListResponse,
    summary="List Kubernetes pods across namespaces or in a specific namespace",
    responses={500: {"model": ErrorResponse}},
)
def get_pods(
    namespace: Optional[str] = Query(
        None, description="Optional namespace filter (e.g. 'kubeguard-demo')"
    )
):
    """Returns actual pods from the connected Kubernetes cluster."""
    try:
        if namespace:
            pod_list = k8s_manager.core_v1.list_namespaced_pod(namespace=namespace).items
        else:
            pod_list = k8s_manager.core_v1.list_pod_for_all_namespaces().items

        items: List[PodItem] = []

        for pod in pod_list:
            name = pod.metadata.name
            ns = pod.metadata.namespace
            phase = pod.status.phase or "Unknown"

            # Check ready condition
            is_ready = False
            for cond in pod.status.conditions or []:
                if cond.type == "Ready":
                    is_ready = cond.status == "True"
                    break

            # Parse container details & total restarts
            containers: List[ContainerDetail] = []
            total_restarts = 0

            # Match specs with statuses
            container_statuses = {
                cs.name: cs for cs in (pod.status.container_statuses or [])
            }

            for spec_c in pod.spec.containers:
                c_name = spec_c.name
                c_image = spec_c.image
                cs = container_statuses.get(c_name)

                c_ready = cs.ready if cs else False
                c_restarts = cs.restart_count if cs else 0
                total_restarts += c_restarts

                state_info = ContainerStateInfo(state="unknown")
                if cs and cs.state:
                    if cs.state.running:
                        state_info = ContainerStateInfo(state="running")
                    elif cs.state.waiting:
                        state_info = ContainerStateInfo(
                            state="waiting",
                            reason=cs.state.waiting.reason,
                            message=cs.state.waiting.message,
                        )
                    elif cs.state.terminated:
                        state_info = ContainerStateInfo(
                            state="terminated",
                            reason=cs.state.terminated.reason,
                            message=cs.state.terminated.message,
                        )

                containers.append(
                    ContainerDetail(
                        name=c_name,
                        image=c_image,
                        ready=c_ready,
                        restart_count=c_restarts,
                        state=state_info,
                    )
                )

            created_at = (
                pod.metadata.creation_timestamp.isoformat()
                if pod.metadata.creation_timestamp
                else "unknown"
            )

            items.append(
                PodItem(
                    name=name,
                    namespace=ns,
                    phase=phase,
                    ready=is_ready,
                    restarts=total_restarts,
                    pod_ip=pod.status.pod_ip,
                    node_name=pod.spec.node_name,
                    containers=containers,
                    labels=pod.metadata.labels or {},
                    created_at=created_at,
                )
            )

        return PodListResponse(total=len(items), items=items)

    except ApiException as e:
        logger.error(f"Kubernetes API error fetching pods: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Kubernetes API error: {e.reason} (HTTP {e.status})",
        )
    except Exception as e:
        logger.error(f"Unexpected error fetching pods: {e}")
        raise HTTPException(status_code=500, detail=str(e))
