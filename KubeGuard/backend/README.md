# KubeGuard Backend

FastAPI Python backend for KubeGuard that interfaces with the local Kubernetes (`kind-kubeguard`) cluster to provide real-time, read-only cluster observation endpoints.

---

## Prerequisites
- Python 3.10+ (tested with Python 3.11.9)
- Local Kubernetes cluster running (`kind-kubeguard`)
- `kubectl` configured with context pointing to `kind-kubeguard`

---

## Setup & Run (Windows PowerShell)

### 1. Create and Activate Virtual Environment
```powershell
cd c:\Users\sambh\OneDrive\Desktop\KubeGuard\KubeGuard\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2. Install Dependencies
```powershell
python -m pip install -r requirements.txt
```

### 3. Run the Backend API Server
```powershell
python run.py
```
Or via uvicorn directly:
```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Server will be running at:
- **API URL:** `http://127.0.0.1:8000`
- **Swagger Interactive Docs:** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`

---

## Read-Only Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Root service health & context verification |
| `GET` | `/api/v1/health` | Lightweight healthcheck |
| `GET` | `/api/v1/cluster` | Cluster connectivity, version, server URL & aggregated counts |
| `GET` | `/api/v1/nodes` | List nodes, conditions, capacity, and system info |
| `GET` | `/api/v1/namespaces` | List all namespaces in the cluster |
| `GET` | `/api/v1/pods` | List all pods or filter with `?namespace=<name>` |
| `GET` | `/api/v1/deployments`| List all deployments or filter with `?namespace=<name>` |
| `GET` | `/api/v1/events` | List recent cluster events |
