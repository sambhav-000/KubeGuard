"""Main FastAPI application for KubeGuard Backend."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.k8s_client import k8s_manager
from app.routers import cluster, nodes, namespaces, pods, deployments, events

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("kubeguard.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager: attempts to connect to Kubernetes on startup."""
    logger.info("Initializing KubeGuard Backend...")
    success, msg = k8s_manager.initialize()
    if success:
        logger.info(f"✓ Kubernetes connectivity established: {msg}")
        if not k8s_manager.is_target_kubeguard:
            logger.warning(
                f"⚠ Active context is '{k8s_manager.active_context}', "
                f"expected '{settings.TARGET_K8S_CONTEXT}'."
            )
        else:
            logger.info(f"✓ Successfully verified target context: '{settings.TARGET_K8S_CONTEXT}'")
    else:
        logger.warning(f"⚠ Could not connect to Kubernetes cluster on startup: {msg}")

    yield

    logger.info("Shutting down KubeGuard Backend.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "KubeGuard Backend API — Real-time read-only Kubernetes monitoring "
        "and observability engine for local and production clusters."
    ),
    lifespan=lifespan,
)

# Configure CORS Middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)

# Register routers under /api/v1
app.include_router(cluster.router, prefix=settings.API_PREFIX)
app.include_router(nodes.router, prefix=settings.API_PREFIX)
app.include_router(namespaces.router, prefix=settings.API_PREFIX)
app.include_router(pods.router, prefix=settings.API_PREFIX)
app.include_router(deployments.router, prefix=settings.API_PREFIX)
app.include_router(events.router, prefix=settings.API_PREFIX)


@app.get("/", tags=["Health"])
def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "healthy",
        "docs_url": "/docs",
        "cluster_context": k8s_manager.active_context,
        "target_context": settings.TARGET_K8S_CONTEXT,
        "is_target_context": k8s_manager.is_target_kubeguard,
    }


@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "kubernetes_connected": k8s_manager.is_initialized,
        "active_context": k8s_manager.active_context,
    }

