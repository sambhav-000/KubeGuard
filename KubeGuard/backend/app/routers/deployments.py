"""Deployments read-only endpoints."""

import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from kubernetes.client.exceptions import ApiException

from app.core.k8s_client import k8s_manager
from app.models.schemas import DeploymentListResponse, DeploymentItem, ErrorResponse

logger = logging.getLogger("kubeguard.deployments")
router = APIRouter(prefix="/deployments", tags=["Deployments"])


@router.get(
    "",
    response_model=DeploymentListResponse,
    summary="List Kubernetes deployments across namespaces or in a specific namespace",
    responses={500: {"model": ErrorResponse}},
)
def get_deployments(
    namespace: Optional[str] = Query(
        None, description="Optional namespace filter (e.g. 'kubeguard-demo')"
    )
):
    """Returns actual deployments from the connected Kubernetes cluster."""
    try:
        if namespace:
            dep_list = k8s_manager.apps_v1.list_namespaced_deployment(
                namespace=namespace
            ).items
        else:
            dep_list = k8s_manager.apps_v1.list_deployment_for_all_namespaces().items

        items: List[DeploymentItem] = []

        for dep in dep_list:
            name = dep.metadata.name
            ns = dep.metadata.namespace
            desired = dep.spec.replicas or 1
            ready = dep.status.ready_replicas or 0
            available = dep.status.available_replicas or 0
            updated = dep.status.updated_replicas or 0

            # Derive status
            if ready >= desired:
                status = "Healthy"
            elif ready == 0:
                status = "Degraded"
            else:
                status = "Progressing"

            images = [
                c.image
                for c in (dep.spec.template.spec.containers or [])
                if c.image
            ]

            match_labels = (
                dep.spec.selector.match_labels
                if dep.spec.selector and dep.spec.selector.match_labels
                else {}
            )

            created_at = (
                dep.metadata.creation_timestamp.isoformat()
                if dep.metadata.creation_timestamp
                else "unknown"
            )

            items.append(
                DeploymentItem(
                    name=name,
                    namespace=ns,
                    desired_replicas=desired,
                    ready_replicas=ready,
                    available_replicas=available,
                    updated_replicas=updated,
                    status=status,
                    images=images,
                    match_labels=match_labels,
                    created_at=created_at,
                )
            )

        return DeploymentListResponse(total=len(items), items=items)

    except ApiException as e:
        logger.error(f"Kubernetes API error fetching deployments: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Kubernetes API error: {e.reason} (HTTP {e.status})",
        )
    except Exception as e:
        logger.error(f"Unexpected error fetching deployments: {e}")
        raise HTTPException(status_code=500, detail=str(e))

