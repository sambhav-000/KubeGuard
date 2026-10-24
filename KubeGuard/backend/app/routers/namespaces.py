"""Namespaces read-only endpoints."""

import logging
from typing import List
from fastapi import APIRouter, HTTPException
from kubernetes.client.exceptions import ApiException

from app.core.k8s_client import k8s_manager
from app.models.schemas import NamespaceListResponse, NamespaceItem, ErrorResponse

logger = logging.getLogger("kubeguard.namespaces")
router = APIRouter(prefix="/namespaces", tags=["Namespaces"])


@router.get(
    "",
    response_model=NamespaceListResponse,
    summary="List Kubernetes cluster namespaces",
    responses={500: {"model": ErrorResponse}},
)
def get_namespaces():
    """Returns actual namespaces from the connected Kubernetes cluster."""
    try:
        ns_list = k8s_manager.core_v1.list_namespace().items
        items: List[NamespaceItem] = []

        for ns in ns_list:
            created_at = (
                ns.metadata.creation_timestamp.isoformat()
                if ns.metadata.creation_timestamp
                else "unknown"
            )
            items.append(
                NamespaceItem(
                    name=ns.metadata.name,
                    status=ns.status.phase or "Active",
                    labels=ns.metadata.labels or {},
                    created_at=created_at,
                )
            )

        return NamespaceListResponse(total=len(items), items=items)

    except ApiException as e:
        logger.error(f"Kubernetes API error fetching namespaces: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Kubernetes API error: {e.reason} (HTTP {e.status})",
        )
    except Exception as e:
        logger.error(f"Unexpected error fetching namespaces: {e}")
        raise HTTPException(status_code=500, detail=str(e))
