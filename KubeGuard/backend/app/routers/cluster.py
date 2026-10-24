"""Cluster overview and connectivity endpoint."""

import logging
from fastapi import APIRouter, HTTPException
from kubernetes.client.exceptions import ApiException

from app.core.k8s_client import k8s_manager
from app.core.config import settings
from app.models.schemas import ClusterOverviewResponse, ClusterVersionInfo, ErrorResponse

logger = logging.getLogger("kubeguard.cluster")
router = APIRouter(prefix="/cluster", tags=["Cluster"])


@router.get(
    "",
    response_model=ClusterOverviewResponse,
    summary="Get Kubernetes cluster connectivity & overview",
    responses={500: {"model": ErrorResponse}},
)
def get_cluster_overview():
    """Reads real cluster info, context, version, and resource counts."""
    is_connected, msg = k8s_manager.initialize()
    if not is_connected:
        return ClusterOverviewResponse(
            connected=False,
            context=k8s_manager.active_context,
            target_context=settings.TARGET_K8S_CONTEXT,
            is_target_context=k8s_manager.is_target_kubeguard,
            server=k8s_manager.cluster_server,
            version=None,
        )

    try:
        # Read real Kubernetes version
        version_data = k8s_manager.version_api.get_code()
        version_info = ClusterVersionInfo(
            major=version_data.major or "1",
            minor=version_data.minor or "0",
            git_version=version_data.git_version or "unknown",
            platform=version_data.platform or "linux/amd64",
        )

        # Read actual resource counts
        nodes = k8s_manager.core_v1.list_node().items
        namespaces = k8s_manager.core_v1.list_namespace().items
        pods = k8s_manager.core_v1.list_pod_for_all_namespaces().items
        deployments = k8s_manager.apps_v1.list_deployment_for_all_namespaces().items

        running = sum(1 for p in pods if p.status.phase == "Running")
        pending = sum(1 for p in pods if p.status.phase == "Pending")
        failed = sum(1 for p in pods if p.status.phase == "Failed")

        healthy_deps = sum(
            1
            for d in deployments
            if (d.status.ready_replicas or 0) >= (d.spec.replicas or 1)
        )

        return ClusterOverviewResponse(
            connected=True,
            context=k8s_manager.active_context,
            target_context=settings.TARGET_K8S_CONTEXT,
            is_target_context=k8s_manager.is_target_kubeguard,
            server=k8s_manager.cluster_server,
            version=version_info,
            total_nodes=len(nodes),
            total_namespaces=len(namespaces),
            total_pods=len(pods),
            running_pods=running,
            pending_pods=pending,
            failed_pods=failed,
            total_deployments=len(deployments),
            healthy_deployments=healthy_deps,
        )

    except ApiException as e:
        logger.error(f"Kubernetes API error fetching cluster overview: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Kubernetes API error: {e.reason} (HTTP {e.status})",
        )
    except Exception as e:
        logger.error(f"Unexpected error fetching cluster overview: {e}")
        raise HTTPException(status_code=500, detail=str(e))
