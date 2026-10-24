
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from kubernetes import client, config
from kubernetes.config.config_exception import ConfigException
from kubernetes.client.exceptions import ApiException

app = FastAPI(title="KubeGuard API", version="0.1.0")

# Local development: Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

try:
    config.load_kube_config()
    core_api = client.CoreV1Api()
    apps_api = client.AppsV1Api()
except (ConfigException, OSError) as exc:
    raise RuntimeError(
        "Unable to load Kubernetes configuration. "
        "Check your current kubectl context."
    ) from exc


def handle_kubernetes_error(exc: ApiException):
    status_code = exc.status if exc.status in (401, 403) else 503
    raise HTTPException(
        status_code=status_code,
        detail="Kubernetes API request failed. Check cluster access."
    ) from exc


@app.get("/")
def root():
    return {
        "application": "KubeGuard API",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/api/health")
def health():
    try:
        nodes = core_api.list_node()
        return {
            "status": "connected",
            "cluster_context": config.list_kube_config_contexts()[1]["name"],
            "node_count": len(nodes.items),
            "ready_nodes": sum(
                1
                for node in nodes.items
                if any(
                    condition.type == "Ready"
                    and condition.status == "True"
                    for condition in (node.status.conditions or [])
                )
            ),
        }
    except ApiException as exc:
        handle_kubernetes_error(exc)


@app.get("/api/nodes")
def get_nodes():
    try:
        result = core_api.list_node()
        return [
            {
                "name": node.metadata.name,
                "status": next(
                    (
                        condition.status
                        for condition in (node.status.conditions or [])
                        if condition.type == "Ready"
                    ),
                    "Unknown",
                ),
                "kubelet_version": node.status.node_info.kubelet_version,
                "os": node.status.node_info.operating_system,
                "architecture": node.status.node_info.architecture,
            }
            for node in result.items
        ]
    except ApiException as exc:
        handle_kubernetes_error(exc)


@app.get("/api/pods")
def get_pods(namespace: str | None = None):
    try:
        result = (
            core_api.list_namespaced_pod(namespace)
            if namespace
            else core_api.list_pod_for_all_namespaces()
        )
        return [
            {
                "name": pod.metadata.name,
                "namespace": pod.metadata.namespace,
                "phase": pod.status.phase or "Unknown",
                "restarts": sum(
                    status.restart_count
                    for status in (pod.status.container_statuses or [])
                ),
                "ready": all(
                    status.ready
                    for status in (pod.status.container_statuses or [])
                ) if pod.status.container_statuses else False,
                "node": pod.spec.node_name,
            }
            for pod in result.items
        ]
    except ApiException as exc:
        handle_kubernetes_error(exc)


@app.get("/api/deployments")
def get_deployments(namespace: str | None = None):
    try:
        result = (
            apps_api.list_namespaced_deployment(namespace)
            if namespace
            else apps_api.list_deployment_for_all_namespaces()
        )
        return [
            {
                "name": deployment.metadata.name,
                "namespace": deployment.metadata.namespace,
                "desired_replicas": deployment.spec.replicas or 0,
                "ready_replicas": deployment.status.ready_replicas or 0,
                "available_replicas": deployment.status.available_replicas or 0,
            }
            for deployment in result.items
        ]
    except ApiException as exc:
        handle_kubernetes_error(exc)


@app.get("/api/namespaces")
def get_namespaces():
    try:
        result = core_api.list_namespace()
        return [
            {
                "name": namespace.metadata.name,
                "status": namespace.status.phase,
            }
            for namespace in result.items
        ]
    except ApiException as exc:
        handle_kubernetes_error(exc)
