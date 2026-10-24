"""Kubernetes Client initialization and context validator."""

import logging
from typing import Dict, Any, Optional, Tuple
from kubernetes import client, config
from kubernetes.client.exceptions import ApiException
from app.core.config import settings

logger = logging.getLogger("kubeguard.k8s")


class KubernetesClientManager:
    """Manages connection to the local Kubernetes cluster."""

    def __init__(self):
        self._initialized = False
        self._active_context: Optional[str] = None
        self._active_cluster_server: Optional[str] = None
        self._core_v1: Optional[client.CoreV1Api] = None
        self._apps_v1: Optional[client.AppsV1Api] = None
        self._version_api: Optional[client.VersionApi] = None

    def initialize(self) -> Tuple[bool, str]:
        """Loads kubeconfig and verifies target context."""
        try:
            # Load default kubeconfig
            config.load_kube_config()
            contexts, active_context = config.list_kube_config_contexts()
            
            if not active_context:
                return False, "No active Kubernetes context found in kubeconfig"

            self._active_context = active_context.get("name")
            cluster_name = active_context.get("context", {}).get("cluster")
            
            # Find cluster server URL
            server_url = "unknown"
            for ctx in contexts:
                if ctx.get("name") == self._active_context:
                    # Look up cluster info in kubeconfig
                    break

            # Create API clients
            self._core_v1 = client.CoreV1Api()
            self._apps_v1 = client.AppsV1Api()
            self._version_api = client.VersionApi()
            
            # Read server from active configuration
            api_client = client.ApiClient()
            self._active_cluster_server = api_client.configuration.host

            self._initialized = True
            logger.info(
                f"Connected to Kubernetes cluster. Context: '{self._active_context}', "
                f"Server: '{self._active_cluster_server}'"
            )
            return True, f"Connected to context '{self._active_context}'"

        except Exception as e:
            self._initialized = False
            logger.error(f"Failed to initialize Kubernetes client: {e}")
            return False, str(e)

    @property
    def is_initialized(self) -> bool:
        return self._initialized

    @property
    def active_context(self) -> Optional[str]:
        return self._active_context

    @property
    def cluster_server(self) -> Optional[str]:
        return self._active_cluster_server

    @property
    def is_target_kubeguard(self) -> bool:
        return self._active_context == settings.TARGET_K8S_CONTEXT

    @property
    def core_v1(self) -> client.CoreV1Api:
        if not self._initialized or not self._core_v1:
            self.initialize()
        return self._core_v1

    @property
    def apps_v1(self) -> client.AppsV1Api:
        if not self._initialized or not self._apps_v1:
            self.initialize()
        return self._apps_v1

    @property
    def version_api(self) -> client.VersionApi:
        if not self._initialized or not self._version_api:
            self.initialize()
        return self._version_api


# Global singleton instance
k8s_manager = KubernetesClientManager()

