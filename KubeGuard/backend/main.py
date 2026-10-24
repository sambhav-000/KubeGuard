import os
import time
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from kubernetes import client, config
from kubernetes.config.config_exception import ConfigException
from kubernetes.client.exceptions import ApiException
from pydantic import BaseModel
import requests

app = FastAPI(title="KubeGuard API", version="0.1.0")

# Local development: Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

PROMETHEUS_URL = os.getenv("PROMETHEUS_URL", "http://127.0.0.1:9090")

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


# ---------------------------------------------------------------------------
# Prometheus Metric Helpers & Pydantic Models
# ---------------------------------------------------------------------------

class MetricsSummary(BaseModel):
    status: str
    cpu_usage_percent: float | None = None
    cpu_usage_cores: float | None = None
    cpu_total_cores: float | None = None
    memory_usage_percent: float | None = None
    memory_usage_bytes: int | None = None
    memory_total_bytes: int | None = None
    network_in_mbps: float | None = None
    network_out_mbps: float | None = None
    timestamp: int | None = None
    message: str | None = None


class MetricTimePoint(BaseModel):
    timestamp: int
    time: str
    cpu: float
    cpu_cores: float
    memory: float
    memory_bytes: int
    network_in: float
    network_out: float


class MetricsRangeResponse(BaseModel):
    status: str
    range: str
    points: list[MetricTimePoint]
    total_cores: float | None = None
    total_memory_bytes: int | None = None
    message: str | None = None


class DeploymentMetric(BaseModel):
    name: str
    namespace: str
    cpu_cores: float
    cpu_display: str
    cpu_percent: float
    memory_bytes: int
    memory_display: str
    memory_percent: float
    pod_count: int


class PodMetric(BaseModel):
    name: str
    namespace: str
    cpu_cores: float
    cpu_display: str
    memory_bytes: int
    memory_display: str


class WorkloadMetricsResponse(BaseModel):
    status: str
    deployments: list[DeploymentMetric]
    pods: list[PodMetric]
    message: str | None = None


_cached_capacity: tuple[float, int] | None = None
_last_capacity_check: float = 0.0


def is_prometheus_healthy(timeout: float = 1.2) -> bool:
    try:
        resp = requests.get(f"{PROMETHEUS_URL}/-/healthy", timeout=timeout)
        return resp.status_code == 200
    except requests.RequestException:
        return False


def query_prometheus(query: str, timeout: float = 2.5) -> dict | None:
    try:
        resp = requests.get(
            f"{PROMETHEUS_URL}/api/v1/query",
            params={"query": query},
            timeout=timeout,
        )
        if resp.status_code == 200:
            data = resp.json()
            if data.get("status") == "success":
                return data
        return None
    except requests.RequestException:
        return None


def query_range_prometheus(query: str, start: int, end: int, step: int, timeout: float = 4.0) -> dict | None:
    try:
        resp = requests.get(
            f"{PROMETHEUS_URL}/api/v1/query_range",
            params={"query": query, "start": start, "end": end, "step": step},
            timeout=timeout,
        )
        if resp.status_code == 200:
            data = resp.json()
            if data.get("status") == "success":
                return data
        return None
    except requests.RequestException:
        return None


def format_cpu(cores: float) -> str:
    if cores <= 0.0:
        return "0m"
    if cores < 0.001:
        return "< 1m"
    return f"{cores * 1000:.1f}m"


def format_bytes(byte_count: int) -> str:
    if byte_count <= 0:
        return "0 MiB"
    if byte_count < 1024 * 1024:
        return f"{byte_count / 1024:.1f} KiB"
    if byte_count < 1024 * 1024 * 1024:
        return f"{byte_count / (1024 * 1024):.1f} MiB"
    return f"{byte_count / (1024 * 1024 * 1024):.2f} GiB"


def get_cluster_capacity() -> tuple[float, int]:
    global _cached_capacity, _last_capacity_check
    now = time.time()
    if _cached_capacity and (now - _last_capacity_check < 60.0):
        return _cached_capacity

    cores = 1.0
    mem_bytes = 1024 * 1024 * 1024

    cores_res = query_prometheus("machine_cpu_cores", timeout=1.5)
    if cores_res and cores_res.get("data", {}).get("result"):
        try:
            cores = float(cores_res["data"]["result"][0]["value"][1])
        except (IndexError, ValueError, TypeError):
            pass

    mem_res = query_prometheus("machine_memory_bytes", timeout=1.5)
    if mem_res and mem_res.get("data", {}).get("result"):
        try:
            mem_bytes = int(float(mem_res["data"]["result"][0]["value"][1]))
        except (IndexError, ValueError, TypeError):
            pass

    # Fallback to Node capacity if Prometheus host metrics are absent
    if cores == 1.0 or mem_bytes == 1024 * 1024 * 1024:
        try:
            nodes = core_api.list_node().items
            if nodes:
                node_cores = 0.0
                node_mem = 0
                for n in nodes:
                    cap = n.status.capacity or {}
                    c_str = cap.get("cpu", "1")
                    node_cores += float(c_str)
                    m_str = cap.get("memory", "1024Ki")
                    if m_str.endswith("Ki"):
                        node_mem += int(m_str[:-2]) * 1024
                    elif m_str.endswith("Mi"):
                        node_mem += int(m_str[:-2]) * 1024 * 1024
                    elif m_str.endswith("Gi"):
                        node_mem += int(m_str[:-2]) * 1024 * 1024 * 1024
                    else:
                        node_mem += int(m_str)
                if node_cores > 0:
                    cores = node_cores
                if node_mem > 0:
                    mem_bytes = node_mem
        except Exception:
            pass

    _cached_capacity = (cores, mem_bytes)
    _last_capacity_check = now
    return _cached_capacity


# ---------------------------------------------------------------------------
# Core Endpoints
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Metrics Endpoints (Prometheus-backed)
# ---------------------------------------------------------------------------

@app.get("/api/metrics/summary", response_model=MetricsSummary)
def get_metrics_summary():
    if not is_prometheus_healthy():
        return MetricsSummary(
            status="unavailable",
            message="Prometheus server is unreachable at configured endpoint.",
        )

    total_cores, total_mem_bytes = get_cluster_capacity()

    cpu_res = query_prometheus('sum(rate(container_cpu_usage_seconds_total{container!="",container!="POD"}[1m]))')
    mem_res = query_prometheus('sum(container_memory_working_set_bytes{container!="",container!="POD"})')
    net_in_res = query_prometheus('sum(rate(container_network_receive_bytes_total[1m]))')
    net_out_res = query_prometheus('sum(rate(container_network_transmit_bytes_total[1m]))')

    if not cpu_res and not mem_res:
        return MetricsSummary(
            status="unavailable",
            message="Prometheus server is unreachable at configured endpoint.",
        )

    now_ts = int(time.time())

    cpu_cores = None
    cpu_percent = None
    if cpu_res and cpu_res.get("data", {}).get("result"):
        try:
            cpu_cores = round(float(cpu_res["data"]["result"][0]["value"][1]), 4)
            cpu_percent = round((cpu_cores / total_cores) * 100, 2)
        except (IndexError, ValueError, TypeError):
            pass

    mem_bytes = None
    mem_percent = None
    if mem_res and mem_res.get("data", {}).get("result"):
        try:
            mem_bytes = int(float(mem_res["data"]["result"][0]["value"][1]))
            mem_percent = round((mem_bytes / total_mem_bytes) * 100, 2)
        except (IndexError, ValueError, TypeError):
            pass

    net_in_mbps = 0.0
    if net_in_res and net_in_res.get("data", {}).get("result"):
        try:
            bps = float(net_in_res["data"]["result"][0]["value"][1])
            net_in_mbps = round(bps / (1024 * 1024), 4)
        except (IndexError, ValueError, TypeError):
            pass

    net_out_mbps = 0.0
    if net_out_res and net_out_res.get("data", {}).get("result"):
        try:
            bps = float(net_out_res["data"]["result"][0]["value"][1])
            net_out_mbps = round(bps / (1024 * 1024), 4)
        except (IndexError, ValueError, TypeError):
            pass

    return MetricsSummary(
        status="connected",
        cpu_usage_percent=cpu_percent,
        cpu_usage_cores=cpu_cores,
        cpu_total_cores=total_cores,
        memory_usage_percent=mem_percent,
        memory_usage_bytes=mem_bytes,
        memory_total_bytes=total_mem_bytes,
        network_in_mbps=net_in_mbps,
        network_out_mbps=net_out_mbps,
        timestamp=now_ts,
    )


@app.get("/api/metrics/range", response_model=MetricsRangeResponse)
def get_metrics_range(range: str = "6h"):
    if not is_prometheus_healthy():
        return MetricsRangeResponse(
            status="unavailable",
            range=range,
            points=[],
            message="Prometheus server is unreachable at configured endpoint.",
        )

    range_durations = {
        "1h": (3600, 60),      # 1 hour, 60s step
        "6h": (21600, 300),    # 6 hours, 5m step
        "24h": (86400, 1200),  # 24 hours, 20m step
        "7d": (604800, 7200),  # 7 days, 2h step
    }
    duration, step = range_durations.get(range, (21600, 300))
    now_ts = int(time.time())
    start_ts = now_ts - duration

    total_cores, total_mem_bytes = get_cluster_capacity()

    cpu_range = query_range_prometheus(
        'sum(rate(container_cpu_usage_seconds_total{container!="",container!="POD"}[1m]))',
        start=start_ts, end=now_ts, step=step,
    )
    mem_range = query_range_prometheus(
        'sum(container_memory_working_set_bytes{container!="",container!="POD"})',
        start=start_ts, end=now_ts, step=step,
    )
    net_in_range = query_range_prometheus(
        'sum(rate(container_network_receive_bytes_total[1m]))',
        start=start_ts, end=now_ts, step=step,
    )
    net_out_range = query_range_prometheus(
        'sum(rate(container_network_transmit_bytes_total[1m]))',
        start=start_ts, end=now_ts, step=step,
    )

    if not cpu_range and not mem_range:
        return MetricsRangeResponse(
            status="unavailable",
            range=range,
            points=[],
            message="Prometheus server is unreachable at configured endpoint.",
        )

    # Build timestamp -> point mapping
    points_map: dict[int, dict] = {}

    def get_or_create(ts: int):
        if ts not in points_map:
            dt = datetime.fromtimestamp(ts)
            time_str = dt.strftime("%H:%M") if range in ("1h", "6h", "24h") else dt.strftime("%m/%d %H:%M")
            points_map[ts] = {
                "timestamp": ts,
                "time": time_str,
                "cpu": 0.0,
                "cpu_cores": 0.0,
                "memory": 0.0,
                "memory_bytes": 0,
                "network_in": 0.0,
                "network_out": 0.0,
            }
        return points_map[ts]

    if cpu_range and cpu_range.get("data", {}).get("result"):
        for ts, val in cpu_range["data"]["result"][0].get("values", []):
            ts_int = int(ts)
            pt = get_or_create(ts_int)
            cores = float(val)
            pt["cpu_cores"] = round(cores, 4)
            pt["cpu"] = round((cores / total_cores) * 100, 2)

    if mem_range and mem_range.get("data", {}).get("result"):
        for ts, val in mem_range["data"]["result"][0].get("values", []):
            ts_int = int(ts)
            pt = get_or_create(ts_int)
            m_bytes = int(float(val))
            pt["memory_bytes"] = m_bytes
            pt["memory"] = round((m_bytes / total_mem_bytes) * 100, 2)

    if net_in_range and net_in_range.get("data", {}).get("result"):
        for ts, val in net_in_range["data"]["result"][0].get("values", []):
            ts_int = int(ts)
            pt = get_or_create(ts_int)
            pt["network_in"] = round(float(val) / (1024 * 1024), 4)

    if net_out_range and net_out_range.get("data", {}).get("result"):
        for ts, val in net_out_range["data"]["result"][0].get("values", []):
            ts_int = int(ts)
            pt = get_or_create(ts_int)
            pt["network_out"] = round(float(val) / (1024 * 1024), 4)

    sorted_points = [
        MetricTimePoint(**pt)
        for _, pt in sorted(points_map.items())
    ]

    return MetricsRangeResponse(
        status="connected",
        range=range,
        points=sorted_points,
        total_cores=total_cores,
        total_memory_bytes=total_mem_bytes,
    )


@app.get("/api/metrics/workloads", response_model=WorkloadMetricsResponse)
def get_workload_metrics(namespace: str | None = None):
    if not is_prometheus_healthy():
        return WorkloadMetricsResponse(
            status="unavailable",
            deployments=[],
            pods=[],
            message="Prometheus server is unreachable.",
        )

    total_cores, total_mem_bytes = get_cluster_capacity()

    cpu_query = 'sum(rate(container_cpu_usage_seconds_total{container!="",container!="POD"}[1m])) by (pod, namespace)'
    mem_query = 'sum(container_memory_working_set_bytes{container!="",container!="POD"}) by (pod, namespace)'

    cpu_res = query_prometheus(cpu_query)
    mem_res = query_prometheus(mem_query)

    if not cpu_res and not mem_res:
        return WorkloadMetricsResponse(
            status="unavailable",
            deployments=[],
            pods=[],
            message="Prometheus server is unreachable.",
        )

    pods_map: dict[tuple[str, str], dict] = {}

    if cpu_res and cpu_res.get("data", {}).get("result"):
        for item in cpu_res["data"]["result"]:
            pod_name = item["metric"].get("pod")
            pod_ns = item["metric"].get("namespace")
            if not pod_name or not pod_ns:
                continue
            if namespace and pod_ns != namespace:
                continue
            cores = float(item["value"][1])
            key = (pod_ns, pod_name)
            if key not in pods_map:
                pods_map[key] = {"cpu_cores": 0.0, "memory_bytes": 0}
            pods_map[key]["cpu_cores"] = cores

    if mem_res and mem_res.get("data", {}).get("result"):
        for item in mem_res["data"]["result"]:
            pod_name = item["metric"].get("pod")
            pod_ns = item["metric"].get("namespace")
            if not pod_name or not pod_ns:
                continue
            if namespace and pod_ns != namespace:
                continue
            mem_b = int(float(item["value"][1]))
            key = (pod_ns, pod_name)
            if key not in pods_map:
                pods_map[key] = {"cpu_cores": 0.0, "memory_bytes": 0}
            pods_map[key]["memory_bytes"] = mem_b

    # Convert pods_map to PodMetric list
    pod_metrics: list[PodMetric] = []
    for (p_ns, p_name), vals in sorted(pods_map.items()):
        cores = vals["cpu_cores"]
        m_bytes = vals["memory_bytes"]
        pod_metrics.append(
            PodMetric(
                name=p_name,
                namespace=p_ns,
                cpu_cores=round(cores, 4),
                cpu_display=format_cpu(cores),
                memory_bytes=m_bytes,
                memory_display=format_bytes(m_bytes),
            )
        )

    # Aggregate per deployment
    deployment_metrics: list[DeploymentMetric] = []
    try:
        dep_list = (
            apps_api.list_namespaced_deployment(namespace).items
            if namespace
            else apps_api.list_deployment_for_all_namespaces().items
        )
        for dep in dep_list:
            dep_name = dep.metadata.name
            dep_ns = dep.metadata.namespace

            # Match pods belonging to this deployment
            matching_pods = [
                (p_name, vals)
                for (p_ns, p_name), vals in pods_map.items()
                if p_ns == dep_ns and (p_name == dep_name or p_name.startswith(f"{dep_name}-"))
            ]

            dep_cpu = sum(vals["cpu_cores"] for _, vals in matching_pods)
            dep_mem = sum(vals["memory_bytes"] for _, vals in matching_pods)

            deployment_metrics.append(
                DeploymentMetric(
                    name=dep_name,
                    namespace=dep_ns,
                    cpu_cores=round(dep_cpu, 4),
                    cpu_display=format_cpu(dep_cpu) if matching_pods else " — ",
                    cpu_percent=round((dep_cpu / total_cores) * 100, 2),
                    memory_bytes=dep_mem,
                    memory_display=format_bytes(dep_mem) if matching_pods else " — ",
                    memory_percent=round((dep_mem / total_mem_bytes) * 100, 2),
                    pod_count=len(matching_pods),
                )
            )
    except Exception:
        pass

    return WorkloadMetricsResponse(
        status="connected",
        deployments=deployment_metrics,
        pods=pod_metrics,
    )
